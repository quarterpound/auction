import { sign } from "hono/jwt";
import { prisma } from "../../database";
import { protectedProcedure, publicProcedure, router } from "../../trpc";
import { createAuctionAndRegisterValidation, createAuctionValidation } from "./validation";
import bcrypt from 'bcrypt'
import {slugify} from 'transliteration'
import dayjs from "dayjs";
import { env } from "../../env";
import { setCookie } from "hono/cookie";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { obfuscateName } from "utils";
import { localEventEmitter, WATCHING } from "../../events";
import { observable } from "@trpc/server/observable";

export const auctionRoute = router({
  createAndRegister: publicProcedure.input(createAuctionAndRegisterValidation).mutation(async ({input, ctx: {c}}) => {
    const {post, user, jwt} = await prisma.$transaction(async (tx) => {
      const created = await tx.user.create({
        data: {
          name: input.name,
          phone: input.phone,
          passwords: {
            create: {
              hash: await bcrypt.hash(input.password, 12)
            }
          },
        }
      })

      const post = await tx.post.create({
        data: {
          name: input.title,
          slug: slugify(input.title),
          description: input.description,
          descriptionHtml: input.description,
          endTime: input.endTime,
          priceMin: input.reservePrice,
          authorId: created.id,
          currency: input.currency,
          bidIncrement: input.bidIncrement,
          AssetOnPost: {
            createMany: {
              data: input.assets.map(item => ({
                assetId: item.id
              }))
            }
          }
        }
      })

      const jwt = await sign({
        sub: created.id,
        exp: Math.floor(dayjs().add(7, 'days').toDate().getTime() / 1000),
      }, env.JWT_SECRET)

      return {
        jwt,
        post,
        user: created
      }
    })

    if(c) {
      setCookie(c, 'authorization', jwt)
    }
    return {
      post, user, jwt,
    }
  }),
  create: protectedProcedure.input(createAuctionValidation).mutation(async ({input, ctx: {user}}) => {
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
        AssetOnPost: {
          createMany: {
            data: input.assets.map(item => ({
              assetId: item.id
            }))
          }
        }
      }
    })

    return post
  }),
  findBySlug: publicProcedure.input(z.object({ slug: z.string() })).query(async ({ input: {slug} }) => {
    const post = await prisma.post.findUnique({
      where: {
        slug
      },
      include: {
        AssetOnPost: {
          include: {
            asset: true
          }
        },
        Bids: {
          include: {
            author: true,
          },
          orderBy: {
            createdAt: 'desc'
          },
          take: 5,
        },
      }
    })

    if(!post) {
      throw new TRPCError({code: 'NOT_FOUND'})
    }

    return {...post, bids: post.Bids.map(item => ({
      ...item,
      author: {
        ...item.author,
        name: `${obfuscateName(item.author.name ?? '')}`,
      }
    }))};
  }),
  findBidsByAuctionId: publicProcedure.input(z.object({ id: z.number() })).query(async ({input: {id}}) => {
    const data = await prisma.bid.findMany({
      where: {
        postId: id,
      },
      orderBy: {
        createdAt: 'desc'
      },
      include: {
        author: true,
      },
      take: 5,
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
        name: true,
        description: true,
        descriptionHtml: true,
        endTime: true,
        priceMin: true,
        bidIncrement: true,
        currency: true,
      }
    })

    if(!post) {
      throw new TRPCError({code: 'NOT_FOUND'})
    }

    return post
  }),
  listenForViewCount: publicProcedure.input(z.object({id: z.number()})).subscription(async ({input: {id}, ctx: {user}}) => observable<number>((emit) => {
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
