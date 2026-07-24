export default function DiscountPartnersPage() {
  return (
    <section className="py-16">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 max-w-6xl mx-auto">
          {Array.from({ length: 14 }, (_, i) => i + 1).map((num) => (
            <div key={num} className="flex items-center justify-center p-4 bg-white rounded-xl border">
              <img
                src={`/images/partners/pro-${num}.jpg`}
                alt={`Partner ${num}`}
                className="max-h-20 object-contain"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
