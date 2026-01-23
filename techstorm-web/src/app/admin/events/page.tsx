import EventsManager from "@/components/admin/EventsManager";
import { getEvents } from "@/app/actions/events";

export const metadata = {
  title: "TechStorm Admin | Events",
  description: "Manage upcoming and past events.",
};

export default async function EventsPage() {
  const events = await getEvents();
  return <EventsManager initialEvents={events} />;
}
