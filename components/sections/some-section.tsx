"use client";

const benefits = [
	{
		src: "https://res.cloudinary.com/dg0m1wsvu/image/upload/f_auto,q_auto/v1670960629/components/benefits-icons/icon-no-sugar_1.svg",
		alt: "No Sugar",
		label: "No Sugar",
	},
	{
		src: "https://res.cloudinary.com/dg0m1wsvu/image/upload/f_auto,q_auto/v1670960629/components/benefits-icons/icon-gluten-free.svg",
		alt: "No Gluten",
		label: "No Gluten",
	},
	{
		src: "https://res.cloudinary.com/dg0m1wsvu/image/upload/f_auto,q_auto/v1670960629/components/benefits-icons/icon-ingredients.svg",
		alt: "No Dodgy Ingredients",
		label: "No Dodgy Ingredients",
	},
	{
		src: "https://res.cloudinary.com/dg0m1wsvu/image/upload/f_auto,q_auto/v1670960629/components/benefits-icons/icon-vegan-friendly.svg",
		alt: "Vegan Friendly",
		label: "Vegan Friendly",
	},
	{
		src: "https://res.cloudinary.com/dg0m1wsvu/image/upload/f_auto,q_auto/v1670960629/components/benefits-icons/icon-kteo.svg",
		alt: "Paleo-Keto Friendly",
		label: "Paleo-Keto Friendly",
	},
];

export default function BenefitsSection() {
	return (
		<section className=" pb-2 pt-6 ">
			<div className="mx-auto flex max-w-[1000px] flex-row flex-wrap items-stretch justify-center pb-6 pt-8 text-center">
				{benefits.map((benefit) => (
					<div
						key={benefit.alt}
						className="flex w-1/2 flex-col items-center p-4 text-center lg:w-1/5"
					>
						<img
							src={benefit.src}
							width={55}
							height={55}
							alt={benefit.alt}
							loading="lazy"
							className="opacity-60 dark:opacity-100 dark:invert"
						/>
						<div className="my-6 text-sm font-semibold text-white dark:text-white">
							{benefit.label}
						</div>
					</div>
				))}
			</div>
		</section>
	);
}
