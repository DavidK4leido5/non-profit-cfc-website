import { createEffect, onMount } from "solid-js";
import { useLocation } from "@solidjs/router";
import { BoardPageView } from "@church/ui/board-page";
import { siteContent } from "~/content/site.content";

function scrollToHash(hash: string) {
  const id = hash.replace(/^#/, "");
  if (!id) return;

  window.setTimeout(() => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, 80);
}

export function BoardPage() {
  const location = useLocation();
  const board = siteContent.board;

  onMount(() => {
    scrollToHash(location.hash);
  });

  createEffect(() => {
    scrollToHash(location.hash);
  });

  return (
    <BoardPageView
      hero={board.hero}
      ministries={board.ministries}
    />
  );
}
