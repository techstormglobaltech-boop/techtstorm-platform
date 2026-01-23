import Image from "next/image";
import Link from "next/link";
import Reveal from "@/components/ui/Reveal";
import { getEvents } from "@/app/actions/events";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "TechStorm | Events",
  description: "Join our upcoming workshops, webinars, and tech conferences.",
};

interface EventItem {
  id: string;
  title: string;
  description: string;
  date: Date;
  location: string;
  image: string | null;
  isVirtual: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export default async function Events() {
  const allEvents = await getEvents() as EventItem[];
  
  const now = new Date();
  const upcomingEvents = allEvents.filter((e: EventItem) => new Date(e.date) >= now);
  const pastEvents = allEvents.filter((e: EventItem) => new Date(e.date) < now).reverse();

  return (
    <>
      {/* HERO */}
      <section className="pt-32 pb-20 bg-brand-dark text-white text-center">
        <div className="container mx-auto px-5">
            <Reveal>
                <h1 className="text-4xl md:text-5xl font-bold mb-4">Connect, Learn & <span className="text-brand-amber">Network</span></h1>
            </Reveal>
            <Reveal delay={200}>
                <p className="text-lg text-slate-300 max-w-2xl mx-auto">
                    Join our upcoming workshops, webinars, and tech conferences to stay ahead of the curve.
                </p>
            </Reveal>
        </div>
      </section>

      {/* UPCOMING EVENTS */}
      <section className="py-20 bg-light-bg min-h-[400px]">
        <div className="container mx-auto px-5">
            <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-4">
                <Reveal width="100%">
                    <div>
                        <h2 className="text-3xl font-bold text-brand-dark border-l-4 border-brand-teal pl-4">Upcoming Events</h2>
                        <p className="text-text-gray mt-2 pl-4">Don't miss out on these opportunities</p>
                    </div>
                </Reveal>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {upcomingEvents.map((event: EventItem, index: number) => {
                    const eventDate = new Date(event.date);
                    const month = eventDate.toLocaleString('default', { month: 'short' }).toUpperCase();
                    const day = eventDate.getDate();
                    const time = eventDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

                    return (
                        <Reveal key={event.id} width="100%" delay={index * 100}>
                            <div className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl hover:-translate-y-2 transition-all duration-300 flex flex-col border border-slate-100 h-full">
                                <div className="relative h-48 bg-slate-200">
                                    {event.image ? (
                                        <Image src={event.image} alt={event.title} fill className="object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-slate-400">
                                            <i className="fas fa-calendar-alt text-4xl"></i>
                                        </div>
                                    )}
                                    <div className="absolute top-4 right-4 bg-white p-2 rounded-lg shadow-lg text-center min-w-[60px]">
                                        <span className="block text-brand-teal text-xs font-bold uppercase">{month}</span>
                                        <span className="block text-brand-dark text-xl font-bold">{day}</span>
                                    </div>
                                </div>
                                <div className="p-6 flex flex-col flex-1">
                                    <span className="text-brand-amber text-xs font-bold uppercase tracking-wider mb-2">
                                        {event.isVirtual ? 'Webinar' : 'Workshop'}
                                    </span>
                                    <h3 className="text-xl font-bold text-brand-dark mb-3 leading-tight">{event.title}</h3>
                                    <div className="flex flex-col gap-2 text-sm text-text-gray mb-4">
                                        <span className="flex items-center gap-2"><i className="far fa-clock text-brand-teal"></i> {time}</span>
                                        <span className="flex items-center gap-2"><i className="fas fa-map-marker-alt text-brand-teal"></i> {event.location}</span>
                                    </div>
                                    <p className="text-slate-600 text-sm mb-6 flex-1 line-clamp-3">{event.description}</p>
                                    <Link href={event.isVirtual ? event.location : "/contact"} target={event.isVirtual ? "_blank" : "_self"} className="block w-full text-center bg-brand-amber text-brand-dark font-bold py-3 rounded-lg hover:bg-[#e6a200] transition-colors">
                                        {event.isVirtual ? 'Join Webinar' : 'Reserve Seat'}
                                    </Link>
                                </div>
                            </div>
                        </Reveal>
                    );
                })}

                {upcomingEvents.length === 0 && (
                    <div className="col-span-full py-20 text-center text-slate-400 bg-white rounded-xl border border-dashed border-slate-200">
                        <p>No upcoming events at the moment. Check back soon!</p>
                    </div>
                )}
            </div>
        </div>
      </section>

      {/* PAST EVENTS */}
      {pastEvents.length > 0 && (
        <section className="py-20 bg-slate-100">
            <div className="container mx-auto px-5">
                <Reveal width="100%">
                    <div className="flex justify-between items-center mb-8">
                        <h2 className="text-2xl font-bold text-brand-dark">Past Events Archive</h2>
                    </div>
                </Reveal>
                
                <div className="flex flex-col gap-4">
                    {pastEvents.map((item: EventItem, index: number) => {
                        const dateStr = new Date(item.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }).toUpperCase();
                        return (
                            <Reveal key={item.id} width="100%" delay={index * 100}>
                                <div className="bg-white/80 p-6 rounded-lg flex flex-col md:flex-row md:items-center gap-4 hover:bg-white hover:shadow-md transition-all">
                                    <div className="font-bold text-slate-500 w-40 border-b md:border-b-0 md:border-r border-slate-200 pb-2 md:pb-0">{dateStr}</div>
                                    <div className="font-bold text-brand-dark flex-1 text-lg">{item.title}</div>
                                    <div className="text-slate-400 text-sm italic">Event Completed</div>
                                </div>
                            </Reveal>
                        );
                    })}
                </div>
            </div>
        </section>
      )}
    </>
  );
}