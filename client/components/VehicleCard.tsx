import React, { useState } from "react";
import { Gauge, Settings, ChevronDown, Heart, Check } from "lucide-react";

interface Vehicle {
  id: number;
  featured: boolean;
  viewed: boolean;
  images: string[];
  badges: string[];
  title: string;
  mileage: string;
  transmission: string;
  doors: string;
  doorIcon?: string; // Optional custom door icon URL
  mileageIcon?: string; // Optional custom mileage icon URL
  transmissionIcon?: string; // Optional custom transmission icon URL
  salePrice: string | null;
  payment: string | null;
  dealer: string;
  location: string;
  phone: string;
  seller_type: string;
  seller_account_number: string;
}

interface VehicleCardProps {
  vehicle: Vehicle;
  favorites: { [key: number]: Vehicle };
  onToggleFavorite: (vehicle: Vehicle) => void;
  keeperMessage: number | null;
  // Payment calculation parameters
  termLength?: string;
  interestRate?: string;
  downPayment?: string;
}

export const VehicleCard: React.FC<VehicleCardProps> = ({
  vehicle,
  favorites,
  onToggleFavorite,
  keeperMessage,
  termLength = "60",
  interestRate = "5",
  downPayment = "2000",
}) => {
  const isFavorited = (vehicleId: number) => !!favorites[vehicleId];

  // Calculate monthly payment based on sale price and loan terms
  const calculateMonthlyPayment = (
    salePrice: string,
    termMonths: string,
    apr: string,
    down: string,
  ): string => {
    // Parse sale price - remove $ and commas
    const price = parseFloat(salePrice.replace(/[$,]/g, ""));
    const downAmt = parseFloat(down) || 0;
    const principal = price - downAmt;
    const months = parseInt(termMonths) || 60;
    const rate = parseFloat(apr) / 100 / 12; // Convert APR to monthly rate

    if (isNaN(price) || price <= 0 || principal <= 0) {
      return vehicle.payment || "Call for Price";
    }

    if (rate === 0) {
      // 0% APR - simple division
      const payment = principal / months;
      return `$${Math.round(payment).toLocaleString()}`;
    }

    // Standard loan payment formula
    const payment =
      (principal * rate * Math.pow(1 + rate, months)) /
      (Math.pow(1 + rate, months) - 1);
    return `$${Math.round(payment).toLocaleString()}`;
  };

  // Get the payment to display - either calculated or original
  const getDisplayPayment = (): string => {
    if (
      vehicle.salePrice &&
      (termLength !== "60" || interestRate !== "5" || downPayment !== "2000")
    ) {
      // Recalculate if any payment parameters have changed from defaults
      return calculateMonthlyPayment(
        vehicle.salePrice,
        termLength,
        interestRate,
        downPayment,
      );
    }
    return vehicle.payment || "Call for Price";
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg lg:rounded-xl overflow-hidden hover:shadow-lg transition-shadow vehicle-card flex flex-col h-full">
      <div className="relative">
        <img
          src={vehicle.images ? vehicle.images[0] : ""}
          alt={vehicle.title}
          className="w-full object-cover"
          style={{ height: "200px" }}
        />
        {vehicle.featured && (
          <div className="absolute top-3 left-3 bg-red-600 text-white px-3 py-1.5 rounded-full carzino-featured-badge font-medium">
            Featured!
          </div>
        )}
      </div>

      <div className="p-3 flex-1 flex flex-col">
        <div className="flex gap-2 mb-2 items-center justify-between">
          <div className="flex gap-2 items-center">
            {vehicle.badges.map((badge, index) => (
              <span
                key={index}
                className="carzino-badge-label px-2 py-1 rounded font-medium"
                style={{
                  borderRadius: "7px",
                  backgroundColor: "#f9fafb",
                  color: "rgb(21, 41, 109)",
                }}
              >
                {badge}
              </span>
            ))}
            {vehicle.viewed && (
              <span
                className="carzino-badge-label px-2 py-1 rounded font-medium inline-flex items-center"
                style={{
                  borderRadius: "7px",
                  backgroundColor: "white",
                  border: "1px solid #e5e7eb",
                  color: "rgb(21, 41, 109)",
                }}
              >
                Viewed{" "}
                <Check
                  className="w-3 h-3 ml-0.5"
                  style={{ color: "rgb(21, 41, 109)" }}
                />
              </span>
            )}
            <Heart
              className={`w-4 h-4 cursor-pointer transition-colors ml-1 ${
                isFavorited(vehicle.id)
                  ? "text-red-600 fill-red-600"
                  : "text-red-600 stroke-red-600 fill-white"
              }`}
              onClick={() => onToggleFavorite(vehicle)}
            />
            {keeperMessage === vehicle.id && (
              <span className="text-xs text-gray-600 ml-1 animate-pulse">
                That's a Keeper!
              </span>
            )}
          </div>
        </div>

        <h3 className="carzino-vehicle-title text-gray-900 mb-2 leading-tight overflow-hidden whitespace-nowrap text-ellipsis">
          {vehicle.title}
        </h3>

        <div className="flex items-center justify-start mb-3 pb-2 border-b border-gray-200 carzino-vehicle-details">
          <div className="flex items-center gap-1 mr-4">
            {vehicle.mileageIcon ? (
              <img
                src={vehicle.mileageIcon}
                alt="Mileage icon"
                className="w-4 h-4 object-contain"
              />
            ) : (
              <img
                src="https://cdn.builder.io/api/v1/image/assets%2F4d1f1909a98e4ebc8068632229306ce4%2F2b268dcc254a4017a2ef9d9e1c9b3acb?format=webp&width=800"
                alt="Speedometer"
                className="w-4 h-4 object-contain"
              />
            )}
            <span className="text-black font-medium">
              {vehicle.mileage} Mi.
            </span>
          </div>
          <div className="flex items-center gap-1 mr-4">
            {vehicle.transmissionIcon ? (
              <img
                src={vehicle.transmissionIcon}
                alt="Transmission icon"
                className="w-4 h-4 object-contain"
              />
            ) : (
              <img
                src="https://cdn.builder.io/api/v1/image/assets%2F4d1f1909a98e4ebc8068632229306ce4%2F209b197e983f494e94b04a7d87b79174?format=webp&width=800"
                alt="Car parts"
                className="w-4 h-4 object-contain"
              />
            )}
            <span className="text-black font-medium">
              {vehicle.transmission}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-4 h-4 text-gray-600 flex items-center justify-center">
              {vehicle.doorIcon ? (
                <img
                  src={vehicle.doorIcon}
                  alt="Door icon"
                  className="w-4 h-4 object-contain"
                />
              ) : (
                <img
                  src="https://cdn.builder.io/api/v1/image/assets%2F4d1f1909a98e4ebc8068632229306ce4%2Ff5793a859e2548bc9bc984fcae57131c?format=webp&width=800"
                  alt="Car door"
                  className="w-4 h-4 object-contain"
                />
              )}
            </div>
            <span className="text-black font-medium">
              {vehicle.doors.replace(/doors/g, "Doors")}
            </span>
          </div>
        </div>

        <div className="flex justify-center items-start gap-6 mb-1 flex-1">
          {vehicle.salePrice ? (
            <>
              <div className="text-center">
                <div className="carzino-price-label text-gray-500 mb-0">
                  Sale Price
                </div>
                <div className="carzino-price-value text-gray-900">
                  {vehicle.salePrice}
                </div>
              </div>
              {vehicle.payment && (
                <>
                  <div className="w-px h-12 bg-gray-200"></div>
                  <div className="text-center">
                    <div className="carzino-price-label text-gray-500 mb-0">
                      Payments
                    </div>
                    <div className="carzino-price-value text-red-600">
                      {getDisplayPayment()}
                      <span className="text-xs text-black font-normal">
                        /mo*
                      </span>
                    </div>
                  </div>
                </>
              )}
            </>
          ) : (
            <div className="text-center">
              <div className="carzino-price-label text-gray-500 mb-0">
                No Sale Price Listed
              </div>
              <div className="carzino-price-value text-gray-900">
                Call for Price
              </div>
            </div>
          )}
        </div>
      </div>

      <div
        className="border-t border-gray-100 px-3 py-2 mt-auto"
        style={{ backgroundColor: "#f9fafb" }}
      >
        <div className="flex justify-between items-start">
          <div className="flex-1 min-w-0">
            <div
              className="text-black font-medium truncate"
              style={{ fontSize: "12px" }}
            >
              {vehicle.location}
            </div>
          </div>
          <div className="text-right flex-shrink-0">
            <div
              className="text-black hover:text-gray-600 cursor-pointer"
              style={{ fontSize: "12px", fontWeight: 500 }}
            >
              {vehicle.seller_type}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
