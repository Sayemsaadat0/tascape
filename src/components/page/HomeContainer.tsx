"use client";
import { useGetStats } from '@/hooks/stats.hooks';
import React from 'react';
import { BriefcaseIcon, CheckSquareIcon, Building2Icon, UserIcon, UsersIcon } from 'lucide-react';

const HomeContainer = () => {
  const { data: stats, isLoading, error } = useGetStats();

  const statCards = [
    {
      label: 'Projects',
      value: stats?.result?.total_projects ?? 0,
      icon: BriefcaseIcon,
      color: 'text-t-orange'
    },
    {
      label: 'Tasks',
      value: stats?.result?.total_tasks ?? 0,
      icon: CheckSquareIcon,
      color: 'text-t-orange-light'
    },
    {
      label: 'Teams',
      value: stats?.result?.total_teams ?? 0,
      icon: Building2Icon,
      color: 'text-t-orange'
    },
    {
      label: 'Members',
      value: stats?.result?.total_members ?? 0,
      icon: UserIcon,
      color: 'text-t-orange-light'
    },
    ...(stats?.result?.total_users !== null ? [{
      label: 'Users',
      value: stats?.result?.total_users ?? 0,
      icon: UsersIcon,
      color: 'text-t-orange'
    }] : [])
  ];

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <p className="text-white/60">Loading stats...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-64">
        <p className="text-white/60">Failed to load stats</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {statCards.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <div
            key={index}
            className="rounded-[32px] bg-t-black p-6 text-white shadow-[1px_-1px_0px_5px_rgba(0,0,0,0.1)] border-2 border-white"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/60 text-sm mb-2">{stat.label}</p>
                <p className="text-3xl font-bold">{stat.value}</p>
              </div>
              <div className={`${stat.color} bg-white/10 p-4 rounded-full`}>
                <Icon className="w-6 h-6" />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default HomeContainer