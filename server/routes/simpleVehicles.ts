import { RequestHandler } from "express";
import { SimpleMockVehicleService } from "../services/simpleMockVehicleService.js";
import {
  SimplePaginationParams,
  SimpleVehicleFilters,
} from "../types/simpleVehicle.js";

// Use simplified mock service for testing
console.log("🚀 Using SimpleMockVehicleService with original demo format");
const vehicleService = new SimpleMockVehicleService();

/**
 * GET /api/simple-vehicles
 * Fetch paginated vehicles with optional filters (original demo format)
 */
export const getSimpleVehicles: RequestHandler = async (req, res) => {
  try {
    // Parse pagination parameters
    const page = parseInt(req.query.page as string) || 1;
    const pageSize = Math.min(
      parseInt(req.query.pageSize as string) || 20,
      100,
    );

    // Validate pagination parameters
    if (page < 1) {
      return res.status(400).json({
        success: false,
        message: "Page number must be greater than 0",
      });
    }

    if (pageSize < 1 || pageSize > 100) {
      return res.status(400).json({
        success: false,
        message: "Page size must be between 1 and 100",
      });
    }

    const pagination: SimplePaginationParams = {
      page,
      pageSize,
    };

    // Parse location/distance parameters (for future implementation)
    const hasLocationFilter =
      req.query.lat && req.query.lng && req.query.radius;
    if (hasLocationFilter) {
      console.log(
        `🌍 Location filter requested: ${req.query.radius} miles from (${req.query.lat}, ${req.query.lng})`,
      );
      // For now, we'll log this and continue with regular filtering
      // TODO: Implement actual location filtering when migration is complete
    }

    // Parse filter parameters
    const filters: SimpleVehicleFilters = {};

    // Handle array filters (condition, make, driveType, sellerType)
    if (req.query.condition) {
      filters.condition = (req.query.condition as string).split(",");
    }
    if (req.query.make) {
      filters.make = (req.query.make as string).split(",");
    }
    if (req.query.model) {
      filters.model = (req.query.model as string).split(",");
    }
    if (req.query.trim) {
      filters.trim = (req.query.trim as string).split(",");
    }
    if (req.query.body_type) {
      filters.vehicleType = (req.query.body_type as string).split(",");
    }
    if (req.query.driveType) {
      filters.driveType = (req.query.driveType as string).split(",");
    }
    if (req.query.transmission) {
      filters.transmission = (req.query.transmission as string).split(",");
    }
    if (req.query.exteriorColor) {
      filters.exteriorColor = (req.query.exteriorColor as string).split(",");
    }
    if (req.query.sellerType) {
      filters.sellerType = (req.query.sellerType as string).split(",");
    }
    if (req.query.dealer) {
      filters.dealer = (req.query.dealer as string).split(",");
    }

    // Handle single value filters
    if (req.query.search) filters.search = req.query.search as string;
    if (req.query.mileage) filters.mileage = req.query.mileage as string;
    if (req.query.priceMin) filters.priceMin = req.query.priceMin as string;
    if (req.query.priceMax) filters.priceMax = req.query.priceMax as string;
    if (req.query.paymentMin)
      filters.paymentMin = req.query.paymentMin as string;
    if (req.query.paymentMax)
      filters.paymentMax = req.query.paymentMax as string;

    // Fetch vehicles from service (using mock service for now)
    const result = await vehicleService.getVehicles(filters, pagination);

    // Return response
    res.status(200).json(result);
  } catch (error) {
    console.error("Error in getSimpleVehicles route:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      data: [],
      meta: {
        totalRecords: 0,
        totalPages: 0,
        currentPage: 1,
        pageSize: 20,
        hasNextPage: false,
        hasPreviousPage: false,
      },
    });
  }
};

/**
 * GET /api/simple-vehicles/:id
 * Fetch a single vehicle by ID
 */
export const getSimpleVehicleById: RequestHandler = async (req, res) => {
  try {
    const id = parseInt(req.params.id);

    if (isNaN(id) || id < 1) {
      return res.status(400).json({
        success: false,
        message: "Invalid vehicle ID",
      });
    }

    const vehicle = await vehicleService.getVehicleById(id);

    if (!vehicle) {
      return res.status(404).json({
        success: false,
        message: "Vehicle not found",
      });
    }

    res.status(200).json({
      success: true,
      data: vehicle,
    });
  } catch (error) {
    console.error("Error in getSimpleVehicleById route:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

/**
 * GET /api/simple-vehicles/filters
 * Get available filter options
 */
export const getSimpleFilterOptions: RequestHandler = async (req, res) => {
  try {
    const options = await vehicleService.getFilterOptions();

    res.status(200).json({
      success: true,
      data: options,
    });
  } catch (error) {
    console.error("Error in getSimpleFilterOptions route:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      data: {
        makes: [],
        conditions: [],
        driveTypes: [],
        sellerTypes: [],
      },
    });
  }
};

/**
 * GET /api/dealers
 * Get available dealers (only those with seller_type = "Dealer")
 */
export const getDealers: RequestHandler = async (req, res) => {
  try {
    const dealers = await vehicleService.getDealers();

    res.status(200).json({
      success: true,
      data: dealers,
    });
  } catch (error) {
    console.error("Error in getDealers route:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      data: [],
    });
  }
};

/**
 * GET /api/vehicle-types
 * Get available vehicle types with counts (only vehicles with valid body_style)
 */
export const getVehicleTypes: RequestHandler = async (req, res) => {
  try {
    const vehicleTypes = await vehicleService.getVehicleTypeCounts();

    res.status(200).json({
      success: true,
      data: vehicleTypes,
    });
  } catch (error) {
    console.error("Error in getVehicleTypes route:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      data: [],
    });
  }
};

/**
 * GET /api/simple-vehicles/health
 * Service health check endpoint
 */
export const simpleHealthCheck: RequestHandler = async (req, res) => {
  try {
    // Test service connectivity
    const testResult = await vehicleService.getVehicles(
      {},
      { page: 1, pageSize: 1 },
    );

    res.status(200).json({
      success: true,
      message:
        "Simple vehicle service healthy - original demo format with 50,000 vehicles",
      timestamp: new Date().toISOString(),
      serviceConnected: testResult.success,
      usingMockData: true,
      totalRecords: testResult.meta?.totalRecords || 0,
      note: "Simplified schema matching original demo: condition, drivetrain, title, mileage, transmission, doors, price, payments, seller type",
    });
  } catch (error) {
    console.error("Simple vehicle service health check failed:", error);
    res.status(500).json({
      success: false,
      message: "Simple vehicle service connection failed",
      timestamp: new Date().toISOString(),
      serviceConnected: false,
      usingMockData: true,
    });
  }
};
