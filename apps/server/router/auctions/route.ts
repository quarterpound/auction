import { prisma } from "../../database";
import { protectedProcedure, publicProcedure, router } from "../../trpc";
import { createAuctionAndRegisterValidation, createAuctionValidation } from "./validation";
import bcrypt from 'bcrypt'
import {slugify} from 'transliteration'
import dayjs from "dayjs";
import { setCookie } from "hono/cookie";
import { z, ZodError } from "zod";
import { TRPCError } from "@trpc/server";
import { obfuscateName } from "utils";
import { localEventEmitter, WATCHING } from "../../events";
import { observable } from "@trpc/server/observable";
import { InternalRedisConnection } from "../../database/redis";
import { signInternal } from "../../jwt";
import { sendWelcomeEmail } from "../../mail";
import crypto from 'crypto'
import { env } from "../../env";

export const auctionRoute = router({
  createAndRegister: publicProcedure.input(createAuctionAndRegisterValidation).mutation(async ({input, ctx: {c}}) => {
    const {post, usr, jwt} = await prisma.$transaction(async (tx) => {

      const checkUser = await tx.user.findUnique({
        where: {
          email: input.email
        }
      })

      if(checkUser) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          cause: new ZodError([
            {path: ['email'], message: "Email is in use", code: 'custom'}
          ])
        })
      }

      const created = await tx.user.create({
        data: {
          name: input.name,
          email: input.email,
          passwords: {
            create: {
              hash: await bcrypt.hash(input.password, 12)
            }
          },
        }
      })

      const checkPost = await tx.post.findUnique({
        where: {
          slug: slugify(input.title)
        }
      })

      if(checkPost) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          cause: new ZodError([
            {path: ['title'], message: "Post with the same title already exists", code: 'custom'}
          ])
        })
      }

      const post = await tx.post.create({
        data: {
          name: input.title,
          slug: slugify(input.title),
          description: input.description,
          descriptionHtml: input.description,
          endTime: input.endTime,
          pending: true,
          priceMin: input.reservePrice,
          authorId: created.id,
          currency: input.currency,
          bidIncrement: input.bidIncrement,
          categoryId: input.categoryId,
          AssetOnPost: {
            createMany: {
              data: input.assets.map(item => ({
                assetId: item.id
              }))
            }
          }
        },
        include: {
          category: {
            include: {
              parent: true,
            }
          }
        }
      })

      const jwt = await signInternal({
        sub: created.id,
        name: created.name ?? '',
        emailVerified: !!created.emailVerified,
      })


      let num = Math.floor(Math.random() * 1000000);

      let sixDigitNumber = num.toString().padStart(6, '0')

      await tx.verificationRequest.create({
        data: {
          identifier: input.email,
          token: sixDigitNumber,
          expires: dayjs().add(1, 'day').toDate()
        }
      })

      const conn = await InternalRedisConnection.getRedisConnection();
      await conn.set(`post:${post.id}`, post.priceMin)

      try {
        await sendWelcomeEmail(input.email, created.name ?? '', sixDigitNumber, true)
      } catch(e) {
        throw new TRPCError({
          cause: new ZodError([
            {path: ['email'], message: "Could not send email", code: 'custom'}
          ]),
          code: 'BAD_REQUEST'
        })
      }

      return {
        jwt,
        post,
        usr: created
      }
    })

    if(c) {
      setCookie(c, 'authorization', jwt)
    }
    return {
      post, usr, jwt,
    }
  }),
  create: protectedProcedure.input(createAuctionValidation).mutation(async ({input, ctx: {user}}) => {
    if(!user.emailVerified) {
      throw new TRPCError({
        code: 'CONFLICT',
        message: 'Please verify your email'
      })
    }

    const checkPost = await prisma.post.findUnique({
      where: {
        slug: slugify(input.title)
      }
    })

    if(checkPost) {
      throw new TRPCError({
        code: 'BAD_REQUEST',
        cause: new ZodError([
          {path: ['title'], message: "Post with the same title already exists", code: 'custom'}
        ])
      })
    }

    const post = await prisma.post.create({
      data: {
        name: input.title,
        slug: slugify(input.title),
        description: input.description,
        descriptionHtml: input.description,
        endTime: input.endTime,
        priceMin: input.reservePrice,
        authorId: user.id,
        currency: input.currency,
        bidIncrement: input.bidIncrement,
        categoryId: input.categoryId,
        AssetOnPost: {
          createMany: {
            data: input.assets.map(item => ({
              assetId: item.id
            }))
          }
        }
      },
      include: {
        category: {
          include: {
            parent: true,
          }
        }
      }
    })

    const conn = await InternalRedisConnection.getRedisConnection();
    await conn.set(`post:${post.id}`, JSON.stringify({
      currentBid: input.reservePrice,
      endTime: input.endTime,
      bidIncrement: input.bidIncrement
    }))

    return post
  }),
  findBySlug: publicProcedure.input(z.object({ slug: z.string() })).query(async({ input: { slug }, ctx: { user } }) => {
    const post = await prisma.post.findUnique({
      where: {
        slug
      },
      include: {
        _count: {
          select: {
            UserFavorites: true,
            postView: true,
            Bids: true,
          }
        },
        category: {
          include: {
            parent: true
          }
        },
        AssetOnPost: {
          include: {
            asset: true
          }
        },
        Bids: {
          include: {
            author: {
              select: {
                id: true,
                name: true,
              }
            },
          },
          orderBy: {
            createdAt: 'desc'
          },
          take: 12,
        },
      }
    })

    if(!post) {
      throw new TRPCError({code: 'NOT_FOUND'})
    }

    if(post.pending && post.authorId !== user?.id) {
      throw new TRPCError({ code: 'NOT_FOUND'})
    }

    const updateViewCount = async () => {
      let flag = true;

      if(user?.id) {
        flag = !(await prisma.postView.findFirst({
          where: {
            postId: post.id,
            userId: user.id
          }
        }))
      }

      if(flag) {
        await prisma.postView.create({
          data: {
            postId: post.id,
            userId: user?.id
          }
        })
      }
    }

    updateViewCount()

    return {...post, bids: post.Bids.map(item => ({
      ...item,
      author: {
        ...item.author,
        name: item.author.name ? `${obfuscateName(item.author.name ?? '')}`: null,
      }
    }))};
  }),
  findBidsByAuctionId: publicProcedure.input(z.object({ id: z.string() })).query(async ({input: {id}}) => {
    const data = await prisma.bid.findMany({
      where: {
        postId: id,
      },
      orderBy: {
        createdAt: 'desc'
      },
      include: {
        author: {
          select: {
            name: true,
            id: true
          }
        },
      },
      take: 12,
    })

    return data.map(item => ({
      ...item,
      author: {
        ...item.author,
        name: item.author.name ? obfuscateName(item.author.name ?? '') : null,
      }
    }))
  }),
  findMetadataBySlug: publicProcedure.input(z.object({ slug: z.string() })).query(async ({input: {slug}}) => {
    const post = await prisma.post.findUnique({
      where: {
        slug
      },
      select: {
        slug: true,
        name: true,
        description: true,
        descriptionHtml: true,
        endTime: true,
        priceMin: true,
        bidIncrement: true,
        currency: true,
        AssetOnPost: {
          select: {
            asset: true
          }
        },
        category: {
          select: {
            slug: true,
            parent: {
              select: {
                slug: true,
              }
            }
          }
        }
      }
    })

    if(!post) {
      throw new TRPCError({code: 'NOT_FOUND'})
    }

    return post
  }),
  listenForViewCount: publicProcedure.input(z.object({id: z.string()})).subscription(async ({input: {id}, ctx: {user}}) => observable<number>((emit) => {
    const onNewView = (count: number) => {
      emit.next(count);
    }

    emit.next(WATCHING[id] ?? 0)

    localEventEmitter.on('auction-watching', onNewView)

    return () => {
      localEventEmitter.off('auction-watching', onNewView)
    }
  }))
})
