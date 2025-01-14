import rss from '@astrojs/rss';
import { getCollection, render } from 'astro:content';
import type { CollectionEntry } from 'astro:content';
import { experimental_AstroContainer as AstroContainer } from "astro/container";
import { getContainerRenderer as getMDXRenderer } from "@astrojs/mdx";
import { loadRenderers } from "astro:container";
import type { APIContext } from 'astro';


type Note = CollectionEntry<"notes">;


export async function GET(context: APIContext) {

  const renderers = await loadRenderers([getMDXRenderer()]);
  const container = await AstroContainer.create({ renderers });

  const noteEntries = await getCollection("notes", ({ data }: Note) => {
    return import.meta.env.PROD ? data.isDraft !== true : true;
  });

  const items = [];
  for (const note of noteEntries) {

    const { Content } = await render(note);
    const content = await container.renderToString(Content);
    items.push({   
      title: note.data.title,
      pubDate: note.data.createdAt,
      link: `/notes/${note.id}`,
      content: content
    });
  }

  return rss({
    title: "matttrent.com notes feed",
    description: "matttrent.com notes feed",
    site: context.site?.toString() ?? "",
    trailingSlash: false,
    items: items
  });
}
