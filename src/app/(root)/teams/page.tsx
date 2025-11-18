"use client";

import {
  useGetTeamsList,
  useDeleteTeam,
  type TeamType,
} from "@/hooks/teams.hooks";
import React from "react";
import DeleteAction from "@/components/core/actions/DeleteAction";
import { toast } from "sonner";
import TeamForm from "./_components/TeamForm";
import { formatDatestamp } from "@/lib/utils";

const TeamActionCell: React.FC<{ team: TeamType }> = ({ team }) => {
  const deleteTeam = useDeleteTeam(team._id);
  const handleDeleteSubmit = async () => {
    await deleteTeam.mutateAsync();
    toast.success("Team deleted successfully");
  };

  return (
    <div className="flex items-center gap-2">
      <TeamForm instance={team} />
      <DeleteAction
        handleDeleteSubmit={handleDeleteSubmit}
        isLoading={deleteTeam.isPending}
        isOnlyIcon={true}
      />
    </div>
  );
};

const TeamsPage = () => {
  const { data: teams, isLoading, error } = useGetTeamsList();

  // Helper function to truncate name to 10 characters
  const truncateName = (name: string) => {
    if (name.length > 10) {
      return name.substring(0, 10) + "...";
    }
    return name;
  };

  if (error) {
    return (
      <div className="flex justify-center items-center h-64 p-5">
        <p className="text-white/60">Failed to load teams</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-5">
        {Array.from({ length: 6 }).map((_, index) => (
          <div
            key={index}
            className="rounded-[32px] bg-t-black p-6 shadow-[1px_-1px_0px_5px_rgba(0,0,0,0.1)] border-2 border-white"
          >
            <div className="space-y-6">
              {/* Header skeleton */}
              <div className="space-y-2">
                <div className="h-6 w-32 bg-white/20 rounded animate-pulse"></div>
                <div className="h-4 w-40 bg-white/20 rounded animate-pulse"></div>
              </div>
              {/* Divider */}
              <div className="h-px bg-white/10"></div>
              {/* Members skeleton */}
              <div className="space-y-2">
                <div className="h-3 w-16 bg-white/20 rounded animate-pulse"></div>
                <div className="flex flex-wrap gap-2">
                  <div className="h-7 w-20 bg-white/20 rounded-full animate-pulse"></div>
                  <div className="h-7 w-24 bg-white/20 rounded-full animate-pulse"></div>
                  <div className="h-7 w-18 bg-white/20 rounded-full animate-pulse"></div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-3 p-5">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-t-black mb-4">
          Teams
          {teams?.results?.length ? ` (${teams.results.length})` : ""}
        </h1>
        <div>
          <TeamForm  />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {teams?.results?.map((team) => (
          <div
            key={team._id}
            className="rounded-[32px] bg-t-black p-6 text-white shadow-[1px_-1px_0px_5px_rgba(0,0,0,0.1)] border-2 border-white hover:border-t-orange/50 transition-colors"
          >
            {/* Header Section */}
            <div className="flex justify-between items-start mb-6">
              <div className="flex-1 pr-4">
                <h3 className="text-xl font-semibold mb-2 text-white">{team.title}</h3>
                <div className="flex items-center gap-2">
                  <span className="text-white/60 text-xs">
                    {team.members?.length || 0} member{team.members?.length !== 1 ? "s" : ""}
                  </span>
                  {team.createdAt && (
                    <>
                      <span className="text-white/40">•</span>
                      <span className="text-white/40 text-xs">
                        {formatDatestamp(team.createdAt)}
                      </span>
                    </>
                  )}
                </div>
              </div>
              <TeamActionCell team={team} />
            </div>

            {/* Members Section */}
            {team.members && team.members.length > 0 ? (
              <div className="space-y-3">
                <div className="h-px bg-white/10"></div>
                <div>
                  <p className="text-white/60 text-xs font-medium mb-2 uppercase tracking-wide">
                    Members
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {team.members.map((member) => (
                      <span
                        key={member._id}
                        className="inline-flex items-center px-3 py-1.5 bg-white/10 rounded-full text-sm text-white/90 border border-white/20 hover:bg-white/20 transition-colors"
                      >
                        {truncateName(member.name)}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="h-px bg-white/10"></div>
                <p className="text-white/40 text-sm">No members assigned</p>
              </div>
            )}
          </div>
        ))}
      </div>

      {!isLoading && teams?.results?.length === 0 && (
        <div className="flex justify-center items-center h-64">
          <p className="text-white/60">No teams found</p>
        </div>
      )}
    </div>
  );
};

export default TeamsPage;

