"use client";

import {
  Edit,
  MoreVertical,
  Trash2,
  Eye,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@graphora/ui/components/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@graphora/ui/components/dropdown-menu";

interface DropdownMenuActionsProps {
  viewHref?: string;
  onEdit?: () => void;
  onDelete?: () => void;
}

export default function DropdownMenuActions({ viewHref, onEdit, onDelete }: DropdownMenuActionsProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger render={<Button className="h-8 w-8 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200" size="icon" variant="ghost" />}><MoreVertical className="h-4 w-4" /></DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-40 bg-white dark:bg-[#111420] border-slate-200 dark:border-white/10 rounded-xl">
        {viewHref && (
          <DropdownMenuItem render={<Link href={viewHref as any} />} className="cursor-pointer text-slate-700 dark:text-slate-200 focus:bg-slate-100 dark:focus:bg-white/5 rounded-lg">
            <Eye className="w-4 h-4 mr-2" />
            View
          </DropdownMenuItem>
        )}
        {onEdit && (
          <DropdownMenuItem onClick={onEdit} className="cursor-pointer text-slate-700 dark:text-slate-200 focus:bg-slate-100 dark:focus:bg-white/5 rounded-lg">
            <Edit className="w-4 h-4 mr-2" />
            Edit
          </DropdownMenuItem>
        )}
        {(viewHref || onEdit) && onDelete && <DropdownMenuSeparator className="bg-slate-200 dark:bg-white/10" />}
        {onDelete && (
          <DropdownMenuItem variant="destructive" onClick={onDelete} className="cursor-pointer focus:bg-red-500/10 rounded-lg">
            <Trash2 className="w-4 h-4 mr-2" />
            Delete
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
