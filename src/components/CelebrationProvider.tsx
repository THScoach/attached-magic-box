import { CelebrationModal } from "./CelebrationModal";
import { useCelebration } from "@/hooks/useCelebration";

export function CelebrationProvider() {
  const { isOpen, close, type, title, message, metric, value } = useCelebration();

  return (
    <CelebrationModal
      open={isOpen}
      onClose={close}
      type={type}
      title={title}
      message={message}
      metric={metric}
      value={value}
    />
  );
}
