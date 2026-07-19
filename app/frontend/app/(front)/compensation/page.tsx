import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function CompensationPage() {
  return (
    <div>
      <section className="py-16 bg-linear-to-b from-green-50 to-white">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-2xl md:text-3xl font-bold">Our MLM Compensation Plan</h1>
        </div>
      </section>

      <section className="py-16">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Binary Computation */}
            <Card className="text-center">
              <CardContent className="pt-8 pb-8 px-6 flex flex-col items-center justify-center min-h-62.5">
                <h3 className="text-lg font-semibold mb-4">Binary Computation</h3>
                <p className="text-muted-foreground text-sm mb-6 px-4">
                  This computation plans uses an algorithm that compares left side and right side
                  of genealogy.
                </p>
                <Button variant="outline">VIEW MORE</Button>
              </CardContent>
            </Card>

            {/* Unilevel Marketing */}
            <Card className="text-center">
              <CardContent className="pt-8 pb-8 px-6 flex flex-col items-center justify-center min-h-62.5">
                <h3 className="text-lg font-semibold mb-4">Unilevel Marketing</h3>
                <p className="text-muted-foreground text-sm mb-6 px-4">
                  This uses a ranking system which will allows the user to customize requirement
                  in order to attain certain rank.
                </p>
                <Button variant="outline">VIEW MORE</Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
}
