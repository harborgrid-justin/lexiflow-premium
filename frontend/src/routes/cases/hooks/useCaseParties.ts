import { useModalState } from "@/hooks/core";
import { useNotify } from "@/hooks/useNotify";
import { useMutation, useQuery } from "@/hooks/useQueryHooks";
import { DataService } from "@/services/data/data-service.service";
import { CaseId, Organization, Party, PartyId } from "@/types";
import { Scheduler } from "@/utils/scheduler";
import { useCallback, useEffect, useState } from "react";

export type GroupByOption = "none" | "role" | "group";

export function useCaseParties(
  parties: Party[] = [],
  onUpdate: (parties: Party[]) => void,
) {
  const notify = useNotify();
  const partyModal = useModalState();
  const deleteModal = useModalState();
  const [currentParty, setCurrentParty] = useState<Partial<Party>>({});
  const [groupBy, setGroupBy] = useState<GroupByOption>("group");
  const [grouped, setGrouped] = useState<Record<string, Party[]>>({});
  const [deletePartyId, setDeletePartyId] = useState<string | null>(null);

  const { data: orgs = [] } = useQuery<Organization[]>(
    ["organizations", "all"],
    () => DataService.organization.getOrgs(),
  );

  // Use useMutation for party operations
  const { mutate: deletePartyMutation } = useMutation(
    async (partyId: string) => {
      const newParties = parties.filter((p) => p.id !== partyId);
      onUpdate(newParties);
    },
    {
      onSuccess: () => {
        notify.success("Party deleted successfully");
        deleteModal.close();
        setDeletePartyId(null);
      },
      onError: (error) => {
        notify.error("Failed to delete party");
        console.error("Delete party error:", error);
      },
    },
  );

  useEffect(() => {
    Scheduler.defer(() => {
      if (groupBy === "none") {
        setGrouped({ "All Parties": Array.isArray(parties) ? parties : [] });
        return;
      }
      const groups: Record<string, Party[]> = {};
      if (Array.isArray(parties)) {
        parties.forEach((p) => {
          const key = groupBy === "role" ? p.role : p.partyGroup || "Ungrouped";
          if (!groups[key]) groups[key] = [];
          groups[key].push(p);
        });
      } else {
        // Handle paginated response if needed, otherwise fallback
        const paginatedResponse = parties as { data?: Party[] };
        const safeParties =
          paginatedResponse?.data && Array.isArray(paginatedResponse.data)
            ? paginatedResponse.data
            : [];

        safeParties.forEach((p: Party) => {
          const key = groupBy === "role" ? p.role : p.partyGroup || "Ungrouped";
          if (!groups[key]) groups[key] = [];
          groups[key].push(p);
        });
      }
      setGrouped(groups);
    });
  }, [parties, groupBy]);

  const handleSave = useCallback(() => {
    if (!currentParty.name || !currentParty.role) return;

    let newParties = [...parties];
    if (currentParty.id) {
      // Edit
      newParties = newParties.map((p) =>
        p.id === currentParty.id ? ({ ...p, ...currentParty } as Party) : p,
      );
    } else {
      // Add
      const caseId = (parties.length > 0 ? parties[0]?.caseId : "") as CaseId;
      const newParty: Party = {
        id: `p-${Date.now()}` as PartyId,
        name: currentParty.name!,
        role: currentParty.role!,
        partyGroup: currentParty.partyGroup,
        contact: currentParty.contact || "",
        type: currentParty.type || "Individual",
        counsel: currentParty.counsel,
        linkedOrgId: currentParty.linkedOrgId,
        address: currentParty.address,
        phone: currentParty.phone,
        email: currentParty.email,
        representationType: currentParty.representationType,
        attorneys: currentParty.attorneys,
        caseId,
      };
      newParties.push(newParty);
    }
    onUpdate(newParties);
    partyModal.close();
    setCurrentParty({});
  }, [currentParty, parties, onUpdate, partyModal]);

  const handleDelete = useCallback(
    (id: string) => {
      setDeletePartyId(id);
      deleteModal.open();
    },
    [deleteModal],
  );

  const confirmDelete = useCallback(() => {
    if (deletePartyId) {
      deletePartyMutation(deletePartyId);
    }
  }, [deletePartyId, deletePartyMutation]);

  const openEdit = useCallback(
    (party: Party) => {
      setCurrentParty(party);
      partyModal.open();
    },
    [partyModal],
  );

  const openNew = useCallback(() => {
    setCurrentParty({ type: "Individual" });
    partyModal.open();
  }, [partyModal]);

  return {
    partyModal,
    deleteModal,
    currentParty,
    setCurrentParty,
    groupBy,
    setGroupBy,
    grouped,
    orgs,
    handleSave,
    handleDelete,
    confirmDelete,
    openEdit,
    openNew,
  };
}
