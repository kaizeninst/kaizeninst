"use client";
import Image from "next/image";
import { motion } from "framer-motion";
import { Goal, Heart, UsersRound, Award } from "lucide-react";

const companyValues = [
  {
    title: "Quality First",
    description:
      "We carefully select every product to ensure it meets our high standards for quality and durability.",
    icon: Goal,
  },
  {
    title: "Customer Care",
    description:
      "Your satisfaction is our priority. We're here to help with any questions or concerns you may have.",
    icon: Heart,
  },
  {
    title: "Excellence",
    description:
      "We strive for excellence in every aspect of our business, from product selection to customer service.",
    icon: Award,
  },
  {
    title: "Community",
    description:
      "We believe in building strong relationships with our customers and giving back to our community.",
    icon: UsersRound,
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
    <div className="flex min-h-screen flex-col bg-gradient-to-b from-gray-50 to-white text-gray-800">
      {/* 🌅 Hero Section */}
      <section className="relative flex h-[70vh] w-full items-center justify-center overflow-hidden">
        <Image
          alt="Hero Banner"
          src="https://placehold.co/1600x800/222/FFF?text=Our+Journey"
          fill
          className="object-cover brightness-75"
          unoptimized
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-transparent" />
      </section>

      {/* 📖 Our Story */}
      <section className="px-6 py-20 md:px-16">
        <div className="mx-auto grid max-w-6xl items-center gap-12 md:grid-cols-2">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="space-y-5"
          >
            <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">Our Story</h2>
            <p className="leading-relaxed text-gray-600">
              Founded in 2020, our company began as a small startup with big dreams. We noticed that
              customers were looking for a more personalized and reliable online shopping
              experience, and we set out to create exactly that.
            </p>
            <p className="leading-relaxed text-gray-600">
              Today, we serve thousands of customers worldwide, offering a carefully curated
              selection of products across multiple categories. Our commitment to quality and
              customer satisfaction remains at the heart of everything we do.
            </p>
            <p className="leading-relaxed text-gray-600">
              We believe that shopping should be enjoyable, convenient, and trustworthy. That's why
              we work tirelessly to ensure every aspect of your experience with us exceeds your
              expectations.
            </p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <Image
              alt="Our Story Image"
              src="https://placehold.co/600x450/cccccc/666666?text=Our+Story"
              width={600}
              height={450}
              className="w-full rounded-xl object-cover shadow-xl"
              unoptimized
            />
          </motion.div>
        </div>
      </section>

      {/* 💎 Our Values */}
      <section className="bg-gray-100 px-6 py-20 md:px-16">
        <div className="mx-auto max-w-6xl text-center">
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-3xl font-bold sm:text-4xl"
          >
            Our Core Values
          </motion.h2>
          <p className="mt-3 text-gray-600">
            The principles that drive our business and inspire our people.
          </p>
          <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {companyValues.map((value, i) => (
              <motion.div
                key={i}
                whileHover={{ y: -8 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                className="rounded-xl bg-white p-6 shadow-md hover:shadow-xl"
              >
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-red-100 to-pink-100">
                  <value.icon className="h-8 w-8 text-red-500" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900">{value.title}</h3>
                <p className="mt-2 text-sm text-gray-600">{value.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 👥 Our Team */}
      <section className="relative px-6 py-20 md:px-16">
        <div className="absolute inset-0 bg-gradient-to-b from-white to-gray-100" />
        <div className="relative mx-auto max-w-6xl text-center">
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-3xl font-bold text-gray-900 sm:text-4xl"
          >
            Meet Our Team
          </motion.h2>
          <p className="mt-3 text-gray-600">
            The passionate people behind our innovation and success.
          </p>

          <div className="mt-12 grid gap-10 sm:grid-cols-2 md:grid-cols-3">
            {teamMembers.map((member, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ y: -5, scale: 1.02 }}
                className="rounded-xl bg-white p-6 shadow-md transition-all hover:shadow-xl"
              >
                <Image
                  src={member.photo}
                  alt={member.name}
                  width={120}
                  height={120}
                  className="mx-auto mb-4 h-28 w-28 rounded-full object-cover shadow-lg"
                  unoptimized
                />
                <h3 className="text-lg font-semibold text-gray-900">{member.name}</h3>
                <p className="text-sm text-red-600">{member.title}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
