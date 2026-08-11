import { onCleanup, onMount } from "solid-js";
import grapesjs, { Editor } from "grapesjs";
import "grapesjs/dist/css/grapes.min.css";
import { adminApi } from "../api";

export type GrapesEditorProps = {
  initialHtml?: string;
  initialCss?: string;
  initialProject?: unknown;
  onReady?: (editor: Editor) => void;
};

/**
 * Minimal GrapesJS canvas — mount/destroy in Solid lifecycle.
 * Asset uploads go through the admin Cloudinary endpoint.
 */
export function GrapesEditor(props: GrapesEditorProps) {
  let host!: HTMLDivElement;
  let editor: Editor | undefined;

  onMount(() => {
    editor = grapesjs.init({
      container: host,
      height: "560px",
      width: "auto",
      fromElement: false,
      storageManager: false,
      noticeOnUnload: false,
      canvas: {
        styles: [
          "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400&family=Lora:wght@400;500&family=DM+Sans:wght@500;600;700&display=swap",
        ],
      },
      deviceManager: {
        devices: [
          { name: "Desktop", width: "" },
          { name: "Tablet", width: "768px", widthMedia: "992px" },
          { name: "Mobile", width: "375px", widthMedia: "480px" },
        ],
      },
      assetManager: {
        upload: false,
        uploadFile: async (event) => {
          const input = event?.dataTransfer
            ? event.dataTransfer.files
            : (event?.target as HTMLInputElement | undefined)?.files;
          const files = input ? Array.from(input) : [];
          for (const file of files) {
            const asset = await adminApi.uploadAsset(file);
            editor?.AssetManager.add({
              src: asset.secureUrl,
              name: asset.originalFilename ?? asset.publicId,
              type: "image",
            });
          }
        },
      },
      blockManager: {
        blocks: [
          {
            id: "section",
            label: "Section",
            content:
              '<section style="padding:2rem 1.25rem"><h2>Section title</h2><p>Write your update here.</p></section>',
          },
          {
            id: "heading",
            label: "Heading",
            content: '<h2 style="font-family:Cormorant Garamond,serif;font-weight:300">Heading</h2>',
          },
          {
            id: "text",
            label: "Text",
            content: '<p style="font-family:Lora,serif;line-height:1.55">Paragraph text</p>',
          },
          {
            id: "image",
            label: "Image",
            content: { type: "image" },
            select: true,
            activate: true,
          },
          {
            id: "quote",
            label: "Quote",
            content:
              '<blockquote style="border-left:3px solid #3454b4;padding-left:1rem;font-style:italic">A short quote</blockquote>',
          },
          {
            id: "button",
            label: "Button",
            content:
              '<a href="#" style="display:inline-block;background:#4169e1;color:#fff;padding:0.7rem 1.1rem;text-decoration:none;border-radius:0.4rem">Learn more</a>',
          },
        ],
      },
    });

    if (props.initialProject) {
      editor.loadProjectData(props.initialProject as object);
    } else if (props.initialHtml) {
      editor.setComponents(props.initialHtml);
      if (props.initialCss) editor.setStyle(props.initialCss);
    }

    props.onReady?.(editor);
  });

  onCleanup(() => {
    editor?.destroy();
    editor = undefined;
  });

  return (
    <div class="overflow-hidden rounded-lg border border-slate-300 bg-white shadow-sm">
      <div ref={host} class="grapes-host min-h-[560px]" />
    </div>
  );
}

export function getEditorPayload(editor: Editor): {
  bodyHtml: string;
  bodyGjs: unknown;
} {
  const html = editor.getHtml();
  const css = editor.getCss() ?? "";
  return {
    bodyHtml: css ? `<style>${css}</style>${html}` : html,
    bodyGjs: editor.getProjectData(),
  };
}
