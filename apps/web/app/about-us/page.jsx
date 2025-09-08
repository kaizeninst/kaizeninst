"use client";

import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import Image from "next/image";

const companyValues = [
  {
    title: "Quality First",
    description:
      "We carefully select every product to ensure it meets our high standards for quality and durability.",
  },
  {
    title: "Customer Care",
    description:
      "Your satisfaction is our priority. We're here to help with any questions or concerns you may have.",
  },
  {
    title: "Excellence",
    description:
      "We strive for excellence in every aspect of our business, from product selection to customer service.",
  },
  {
    title: "Community",
    description:
      "We believe in building strong relationships with our customers and giving back to our community.",
  },
];

const teamMembers = [
  {
    name: "John Cena",
    title: "Chief Executive Officer",
    photo: "https://placehold.co/100x100/a0c7e8/000?text=John",
  },
  {
    name: "Michael Chen",
    title: "Chief Technology Officer",
    photo: "https://placehold.co/100x100/c7e8a0/000?text=Michael",
  },
  {
    name: "Emily Rodriguez",
    title: "Chief Marketing Officer",
    photo: "https://placehold.co/100x100/e8a0c7/000?text=Emily",
  },
];

export default function AboutUsPage() {
  return (
    <div className="flex min-h-screen flex-col bg-gray-50 text-gray-800">
      <Navbar />
      <div className="flex flex-grow flex-col">
        {/* Hero Banner Section */}
        <section className="w-full px-4 py-12 sm:px-8 md:px-16 md:py-20">
          <div className="mx-auto w-full max-w-6xl overflow-hidden rounded-lg shadow-xl">
            <Image
              alt="Hero Banner"
              src="https://placehold.co/1200x400/808080/FFFFFF?text=Company+Components"
              width={1200}
              height={400}
              className="h-auto w-full object-cover"
              unoptimized
            />
          </div>
        </section>

        {/* Our Story Section */}
        <section className="w-full bg-white px-4 py-12 sm:px-8 md:px-16 md:py-20">
          <div className="mx-auto grid max-w-6xl items-center gap-12 md:grid-cols-2">
            <div className="space-y-4">
              <h2 className="text-3xl font-bold sm:text-4xl">Our Story</h2>
              <p className="text-base text-gray-600 sm:text-lg">
                Founded in 2020, our company began as a small startup with big dreams. We noticed
                that customers were looking for a more personalized and reliable online shopping
                experience, and we set out to create exactly that.
              </p>
              <p className="text-base text-gray-600 sm:text-lg">
                Today, we serve thousands of customers worldwide, offering a carefully curated
                selection of products across multiple categories. Our commitment to quality and
                customer satisfaction remains at the heart of everything we do.
              </p>
              <p className="text-base text-gray-600 sm:text-lg">
                We believe that shopping should be enjoyable, convenient, and trustworthy. That's
                why we work tirelessly to ensure every aspect of your experience with us exceeds
                your expectations.
              </p>
            </div>
            <div>
              <Image
                alt="Our Story Image"
                src="https://placehold.co/600x450/cccccc/888888?text=Our+Story+Image"
                width={600}
                height={450}
                className="h-auto w-full rounded-lg object-cover shadow-lg"
                unoptimized
              />
            </div>
          </div>
        </section>

        {/* Our Values Section */}
        <section className="w-full bg-gray-100 px-4 py-12 sm:px-8 md:px-16 md:py-20">
          <div className="mx-auto max-w-6xl text-center">
            <h2 className="text-3xl font-bold sm:text-4xl">Our Values</h2>
            <p className="mt-2 text-base text-gray-600 sm:text-lg">
              The principles that guide everything we do
            </p>
            <div className="mx-auto mt-8 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
              {companyValues.map((value, index) => (
                <div
                  key={index}
                  className="rounded-lg bg-white p-6 text-center shadow-md transition-transform duration-300 hover:scale-105"
                >
                  <h3 className="mb-2 text-lg font-semibold sm:text-xl">{value.title}</h3>
                  <p className="text-gray-600">{value.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Our Team Section */}
        <section className="w-full bg-white px-4 py-12 sm:px-8 md:px-16 md:py-20">
          <div className="mx-auto max-w-6xl text-center">
            <h2 className="text-3xl font-bold sm:text-4xl">Meet Our Team</h2>
            <p className="mt-2 text-base text-gray-600 sm:text-lg">
              The passionate people behind our success
            </p>
            <div className="mx-auto mt-8 grid grid-cols-1 gap-8 sm:grid-cols-2 md:grid-cols-3">
              {teamMembers.map((member, index) => (
                <div
                  key={index}
                  className="rounded-lg bg-gray-100 p-6 text-center shadow-md transition-transform duration-300 hover:scale-105"
                >
                  <Image
                    src={member.photo}
                    alt={member.name}
                    width={96}
                    height={96}
                    className="mx-auto mb-4 h-24 w-24 rounded-full object-cover shadow-lg"
                    unoptimized
                  />
                  <h3 className="text-lg font-semibold sm:text-xl">{member.name}</h3>
                  <p className="text-gray-600">{member.title}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
      <Footer />
    </div>
  );
}
