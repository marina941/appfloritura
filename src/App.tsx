import { useState } from "react";
import { TopBar, type View } from "./components/layout/TopBar";
import { PlanningView } from "./components/planning/PlanningView";
import { CalendarView } from "./components/calendar/CalendarView";
import { ListView } from "./components/list/ListView";
import { PostEditorModal } from "./components/post/PostEditorModal";
import { usePlanStore } from "./store/usePlanStore";

function App() {
  const [view, setView] = useState<View>("planejamento");
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);
  const selectedPost = usePlanStore((s) =>
    s.posts.find((p) => p.id === selectedPostId),
  );

  return (
    <div className="min-h-screen bg-white">
      <TopBar view={view} onChangeView={setView} />

      {view === "planejamento" && (
        <PlanningView onPlanGenerated={() => setView("calendario")} />
      )}
      {view === "calendario" && (
        <CalendarView onSelectPost={(post) => setSelectedPostId(post.id)} />
      )}
      {view === "lista" && (
        <ListView onSelectPost={(post) => setSelectedPostId(post.id)} />
      )}

      {selectedPost && (
        <PostEditorModal post={selectedPost} onClose={() => setSelectedPostId(null)} />
      )}
    </div>
  );
}

export default App;
