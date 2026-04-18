"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

export function SubscriberActions() {
  return (
    <div className="flex gap-2">
      <button
        type="button"
        className="rounded-sm border border-border px-3 py-1.5 text-sm text-foreground transition-colors hover:bg-surface"
        onClick={async () => {
          const res = await fetch("/api/admin/subscribers/export");
          if (res.ok) {
            const blob = await res.blob();
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `subscribers-${new Date().toISOString().split("T")[0]}.csv`;
            a.click();
            URL.revokeObjectURL(url);
          }
        }}
      >
        Export CSV
      </button>
    </div>
  );
}

export function DeleteSubscriberButton({
  subscriberId,
}: {
  subscriberId: string;
}) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleDelete = async () => {
    if (isDeleting) {
      return;
    }

    if (!window.confirm("Delete this subscriber? This is irreversible.")) {
      return;
    }

    setIsDeleting(true);

    try {
      const response = await fetch(`/api/admin/subscribers/${subscriberId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        window.alert("Failed to delete subscriber.");
        return;
      }

      startTransition(() => {
        router.refresh();
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <button
      type="button"
      className="text-xs text-red-600 hover:underline disabled:cursor-not-allowed disabled:opacity-60"
      disabled={isDeleting || isPending}
      onClick={handleDelete}
    >
      {isDeleting || isPending ? "Deleting..." : "Delete"}
    </button>
  );
}
