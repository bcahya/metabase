import React, { useCallback } from "react";
import { t } from "ttag";
import { Moment } from "moment";
import Question from "metabase-lib/lib/Question";
import Settings from "metabase/lib/settings";
import { formatDateTimeWithUnit } from "metabase/lib/formatting";
import { MODAL_TYPES } from "metabase/query_builder/constants";
import SidebarContent from "metabase/query_builder/components/SidebarContent";
import TimelinePanel from "metabase/timelines/questions/containers/TimelinePanel";
import { Timeline, TimelineEvent } from "metabase-types/api";

export interface TimelineSidebarProps {
  question: Question;
  timelines: Timeline[];
  visibleTimelineIds: number[];
  selectedTimelineEventIds: number[];
  xDomain?: [Moment, Moment];
  onShowTimelines?: (timelines: Timeline[]) => void;
  onHideTimelines?: (timelines: Timeline[]) => void;
  onOpenModal?: (modal: string, modalContext?: unknown) => void;
  onClose?: () => void;
}

const TimelineSidebar = ({
  question,
  timelines,
  visibleTimelineIds,
  selectedTimelineEventIds,
  xDomain,
  onOpenModal,
  onShowTimelines,
  onHideTimelines,
  onClose,
}: TimelineSidebarProps) => {
  const handleNewEvent = useCallback(() => {
    onOpenModal?.(MODAL_TYPES.NEW_EVENT);
  }, [onOpenModal]);

  const handleEditEvent = useCallback(
    (event: TimelineEvent) => {
      onOpenModal?.(MODAL_TYPES.EDIT_EVENT, event.id);
    },
    [onOpenModal],
  );

  const handleToggleTimeline = useCallback(
    (timeline: Timeline, isVisible: boolean) => {
      if (isVisible) {
        onShowTimelines?.([timeline]);
      } else {
        onHideTimelines?.([timeline]);
      }
    },
    [onShowTimelines, onHideTimelines],
  );

  return (
    <SidebarContent title={formatTitle(xDomain)} onClose={onClose}>
      <TimelinePanel
        timelines={timelines}
        collectionId={question.collectionId()}
        visibleTimelineIds={visibleTimelineIds}
        selectedEventIds={selectedTimelineEventIds}
        onNewEvent={handleNewEvent}
        onEditEvent={handleEditEvent}
        onToggleTimeline={handleToggleTimeline}
      />
    </SidebarContent>
  );
};

const formatTitle = (xDomain?: [Moment, Moment]) => {
  return xDomain
    ? t`Events from ${formatDate(xDomain[0])} to ${formatDate(xDomain[1])}`
    : t`Events`;
};

const formatDate = (date: Moment) => {
  return formatDateTimeWithUnit(date, "day", Settings.formattingOptions());
};

export default TimelineSidebar;
