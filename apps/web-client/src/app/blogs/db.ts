import { Client } from "pg"
import { z } from "zod"

export const singleBlogCardResult = z.object({
  id: z.coerce.number(),
  slug: z.string(),
  title: z.string(),
  author_name: z.string(),
  excerpt: z.string(),
  featured_image: z.string(),
  category_title: z.string(),
  category_slug: z.string(),
  date_created: z.coerce.date(),
})

export const singleCategory = z.object({
  id: z.coerce.number(),
  slug: z.string(),
  title: z.string(),
  description: z.string()
})

export const singleFullBlog = singleBlogCardResult.extend({
  content: z.string(),
  author_avatar: z.string(),
})

export type SingleBlogCardResult = z.infer<typeof singleBlogCardResult>

const getClient = () => {
  return new Client({
    user: process.env.DIRECTUS_DB_USER,
    password: process.env.DIRECTUS_DB_PASSWORD,
    database: process.env.DIRECTUS_DB_NAME,
    host: process.env.DIRECTUS_DB_HOST,
    port: parseInt(process.env.DIRECTUS_DB_PORT ?? '5432')
  })
}

export const getCategory = async (slug: string) => {
  const client = getClient()

  await client.connect()


  const data = await client.query(`
    select * from category where slug = $1
  `, [slug])

  if(!data.rowCount) {
    return null;
  }

  return singleCategory.parse(data.rows[0])
}

export const getCategories = async() => {
  const client = getClient();

  await client.connect();

  const data = await client.query(`select * from category c`)

  client.end();

  return data.rows.map(f => singleCategory.parse(f))
}

export const getBlogs = async (category: string | null = null, exclude: string | null = null, page = 0, limit = 10) => {
  const client = getClient()

  await client.connect()

  const [resBlog, resCount] = await Promise.all(
    [
      client.query(`
        select b.id, b.slug, b.featured_image, b.date_created, c.slug as category_slug, concat(du.first_name, ' ' ,du.last_name) as author_name, b.title, b.excerpt, c.title as category_title from blog b left join category c on c.id = b.category left join directus_users du on du.id = b.author left join directus_files df on df.id = b.featured_image where b.status = 'published' ${category ? `and c.slug = $3` : ''} ${exclude ? `and b.slug != '${exclude}'` : ''} order by b.date_created desc limit $1 offset $2;
      `, [limit, limit * page, category ?? undefined].filter(f => f !== undefined)),
      client.query(`
        select count(b.id) from blog b left join category c on c.id = b.category where b.status = 'published' ${category ? `and c.slug = $1` : ''};
      `, [category ?? undefined].filter(f => f !== undefined)),
    ]
  )

  await client.end()

  return {
    data: resBlog.rows.map(data => singleBlogCardResult.parse(data)),
    count: z.coerce.number().parse(resCount.rows[0].count)
  }
}

export const getSingleBlogPost = async (slug: string) => {
  const client = getClient()

  await client.connect()

  const res = await client.query(`
    select
     	b.id,
     	b.slug,
     	b.title,
     	b.featured_image,
     	b.excerpt,
     	b.content,
     	b.date_created,
     	du.avatar as author_avatar,
     	c.slug as category_slug,
     	concat(du.first_name, ' ' ,du.last_name) as author_name,
     	c.title as category_title
    from blog b
     	left join category c on c.id = b.category
     	left join directus_users du on du.id = b.author
     	left join directus_files df on df.id = b.featured_image
    where
     	b.status = 'published' and
     	b.slug = $1;
  `, [slug]);

  await client.end()

  if(!res.rowCount) {
    return null;
  }

  return singleFullBlog.parse(res.rows[0])
}
