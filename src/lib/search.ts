import type { Destination, Filters, Operator, Tour } from "./types";

export function filterTours(
  tours: Tour[],
  operators: Operator[],
  destinations: Destination[],
  filters: Filters,
  query: string,
) {
  const q = query.trim().toLowerCase();
  return tours.filter((tour) => {
    if (tour.status !== "published") return false;
    const op = operators.find((o) => o.id === tour.operatorId);
    const dests = destinations.filter((d) => tour.destinationIds.includes(d.id));
    if (q) {
      const hay = [tour.title, tour.description, ...tour.categories, ...(tour.parks || []), op?.name, ...dests.map((d) => d.name)]
        .join(" ")
        .toLowerCase();
      if (!hay.includes(q)) return false;
    }
    if (filters.country && !dests.some((d) => d.country === filters.country || d.name === filters.country)) return false;
    if (filters.park && !tour.parks.some((p) => p.toLowerCase().includes(filters.park.toLowerCase()))) return false;
    if (filters.types.length && !filters.types.some((t) => tour.categories.includes(t))) return false;
    if (tour.durationDays < filters.duration[0] || tour.durationDays > filters.duration[1]) return false;
    if (tour.priceTo < filters.budget[0] || tour.priceFrom > filters.budget[1]) return false;
    if (filters.month && !tour.bestMonths.includes(filters.month)) return false;
    if (filters.stay && tour.accommodation !== filters.stay) return false;
    if (filters.rating && tour.rating < filters.rating) return false;
    if (filters.verifiedOnly && !op?.verified) return false;
    if (filters.language && !tour.languages.some((l) => l.toLowerCase() === filters.language.toLowerCase()) && !op?.languages.includes(filters.language))
      return false;
    if (filters.groupType && tour.groupType !== filters.groupType) return false;
    if (filters.activities.length) {
      const blob = `${tour.highlights.join(" ")} ${tour.days.map((d) => d.activities).join(" ")}`.toLowerCase();
      if (!filters.activities.some((a) => blob.includes(a.toLowerCase().split(" ")[0]))) return false;
    }
    return true;
  });
}

export function sortTours(tours: Tour[], sort: string) {
  const copy = [...tours];
  if (sort === "price-asc") copy.sort((a, b) => a.priceFrom - b.priceFrom);
  else if (sort === "price-desc") copy.sort((a, b) => b.priceFrom - a.priceFrom);
  else if (sort === "rating") copy.sort((a, b) => b.rating - a.rating);
  else if (sort === "duration") copy.sort((a, b) => a.durationDays - b.durationDays);
  else copy.sort((a, b) => Number(b.featured) - Number(a.featured) || b.rating - a.rating);
  return copy;
}

export function activeFilterCount(filters: Filters) {
  let n = 0;
  if (filters.country) n++;
  if (filters.park) n++;
  if (filters.types.length) n++;
  if (filters.duration[0] !== 3 || filters.duration[1] !== 14) n++;
  if (filters.budget[0] !== 800 || filters.budget[1] !== 12000) n++;
  if (filters.month) n++;
  if (filters.stay) n++;
  if (filters.rating) n++;
  if (filters.verifiedOnly) n++;
  if (filters.language) n++;
  if (filters.groupType) n++;
  if (filters.activities.length) n++;
  return n;
}
