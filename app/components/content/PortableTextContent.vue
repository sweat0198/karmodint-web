<script lang="ts">
import { defineComponent, h, resolveComponent, type PropType, type VNodeChild } from "vue";
import type { PortableTextBlock } from "~/types/portableText";
import { toPortableTextNodes, type PortableTextNode, type PortableTextSegment } from "~/utils/portableText";
import { resolveSanityImageConfig } from "~/utils/sanityImageConfig";
import { sanityImageUrl } from "~/utils/sanityImageUrl";

const DECORATOR_TAGS: Record<string, string> = { strong: "strong", em: "em", code: "code" };

const STYLE_CLASSES: Record<string, string> = {
  h2: "mt-6 text-2xl font-semibold tracking-tight text-brand-navy-heading first:mt-0",
  h3: "mt-4 text-xl font-semibold tracking-tight text-brand-navy-heading first:mt-0",
  h4: "mt-2 text-lg font-semibold text-brand-navy-heading first:mt-0",
  blockquote: "border-l-4 border-slate-200 pl-4 italic text-slate-600",
  normal: "text-base leading-relaxed text-slate-600",
};

const LINK_CLASS =
  "font-semibold text-brand-red underline underline-offset-2 transition-colors hover:text-brand-red-dark";

/**
 * Renders Portable Text (a `blockContent` body, a FAQ answer) with the site's type styles.
 *
 * The block whitelist is small and closed (`blockContentSpec.ts`), so this is a plain render
 * function over `toPortableTextNodes` rather than a library. Internal links (`/…`) go through
 * NuxtLink so they stay client-side and pick up the trailing-slash default (ADR-003).
 */
export default defineComponent({
  name: "PortableTextContent",
  props: {
    blocks: {
      type: Array as PropType<PortableTextBlock[] | null | undefined>,
      default: () => [],
    },
  },
  setup(props) {
    const NuxtLink = resolveComponent("NuxtLink");

    function renderSegment(segment: PortableTextSegment): VNodeChild {
      let content: VNodeChild = segment.text;
      for (const decorator of segment.decorators) {
        const tag = DECORATOR_TAGS[decorator];
        if (tag) content = h(tag, null, [content]);
      }
      if (!segment.href) return content;

      return segment.href.startsWith("/")
        ? h(NuxtLink, { to: segment.href, class: LINK_CLASS }, () => [content])
        : h("a", { href: segment.href, class: LINK_CLASS, rel: "noopener" }, [content]);
    }

    function renderNode(node: PortableTextNode): VNodeChild {
      if (node.kind === "list") {
        return h(
          node.listItem === "number" ? "ol" : "ul",
          {
            class: `${node.listItem === "number" ? "list-decimal" : "list-disc"} flex flex-col gap-2 pl-6 text-base leading-relaxed text-slate-600 marker:text-brand-red`,
          },
          node.items.map((segments) => h("li", null, segments.map(renderSegment))),
        );
      }

      if (node.kind === "image") {
        const { projectId, dataset } = resolveSanityImageConfig();
        const src = sanityImageUrl(node.assetRef, projectId, dataset, { width: 1200, fit: "max" });
        if (!src) return null;
        return h("figure", { class: "flex flex-col gap-2" }, [
          h("img", { src, alt: node.alt ?? "", loading: "lazy", decoding: "async", class: "w-full rounded" }),
          node.caption ? h("figcaption", { class: "text-sm text-slate-500" }, node.caption) : null,
        ]);
      }

      const tag = ["h2", "h3", "h4", "blockquote"].includes(node.style) ? node.style : "p";
      return h(tag, { class: STYLE_CLASSES[node.style] ?? STYLE_CLASSES.normal }, node.spans.map(renderSegment));
    }

    return () =>
      h("div", { class: "flex flex-col gap-4" }, toPortableTextNodes(props.blocks).map(renderNode));
  },
});
</script>
