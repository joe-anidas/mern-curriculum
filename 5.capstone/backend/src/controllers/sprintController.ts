import { Response, NextFunction } from "express";
import Sprint from "../models/Sprint";
import Task from "../models/Task";
import { isValidObjectId } from "../utils/validators";
import { AuthenticatedRequest } from "../middleware/auth";

export async function getSprints(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
) {
  try {
    const actor = req.user!;

    const query: any = {};

    // Non-superadmins can only see sprints from their tenant
    if (actor.role !== "superadmin") {
      query.tenantId = actor.tenantId;
    }

    const sprints = await Sprint.find(query).sort({ createdAt: -1 }).exec();

    // Get task counts for each sprint
    const sprintsWithTaskCount = await Promise.all(
      sprints.map(async (sprint) => {
        const taskCount = await Task.countDocuments({ sprintId: sprint._id });
        return {
          id: sprint._id.toString(),
          name: sprint.name,
          startDate: sprint.startDate,
          endDate: sprint.endDate,
          status: sprint.status,
          tenantId: sprint.tenantId.toString(),
          createdBy: sprint.createdBy.toString(),
          taskCount,
          createdAt: sprint.createdAt,
          updatedAt: sprint.updatedAt,
        };
      }),
    );

    res.json({
      success: true,
      message: "Sprints fetched successfully",
      sprints: sprintsWithTaskCount,
    });
  } catch (err) {
    next(err);
  }
}

export async function getSprint(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
) {
  try {
    const { id } = req.params as { id: string };
    const actor = req.user!;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        error: "Invalid sprint identifier",
      });
    }

    const filters: any = { _id: id };

    if (actor.role !== "superadmin") {
      filters.tenantId = actor.tenantId;
    }

    const sprint = await Sprint.findOne(filters);

    if (!sprint) {
      return res.status(404).json({
        success: false,
        error: "Sprint not found",
      });
    }

    const taskCount = await Task.countDocuments({ sprintId: sprint._id });

    res.json({
      success: true,
      message: "Sprint fetched successfully",
      sprint: {
        id: sprint._id.toString(),
        name: sprint.name,
        startDate: sprint.startDate,
        endDate: sprint.endDate,
        status: sprint.status,
        tenantId: sprint.tenantId.toString(),
        createdBy: sprint.createdBy.toString(),
        taskCount,
        createdAt: sprint.createdAt,
        updatedAt: sprint.updatedAt,
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function createSprint(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
) {
  try {
    const {
      name,
      startDate,
      endDate,
      status = "planned",
    } = req.body as {
      name?: string;
      startDate?: string;
      endDate?: string;
      status?: string;
    };

    const actor = req.user!;

    // Only tenant admins and superadmins can create sprints
    if (actor.role === "user") {
      return res.status(403).json({
        success: false,
        error: "Only administrators can create sprints",
      });
    }

    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        error: "Sprint name is required",
      });
    }

    if (!startDate) {
      return res.status(400).json({
        success: false,
        error: "Start date is required",
      });
    }

    if (!endDate) {
      return res.status(400).json({
        success: false,
        error: "End date is required",
      });
    }

    const parsedStartDate = new Date(startDate);
    const parsedEndDate = new Date(endDate);

    if (isNaN(parsedStartDate.getTime())) {
      return res.status(400).json({
        success: false,
        error: "Invalid start date format",
      });
    }

    if (isNaN(parsedEndDate.getTime())) {
      return res.status(400).json({
        success: false,
        error: "Invalid end date format",
      });
    }

    if (parsedEndDate <= parsedStartDate) {
      return res.status(400).json({
        success: false,
        error: "End date must be after start date",
      });
    }

    if (!["planned", "active", "completed"].includes(status)) {
      return res.status(400).json({
        success: false,
        error: "Status must be one of: planned, active, completed",
      });
    }

    const sprint = new Sprint({
      name: name.trim(),
      startDate: parsedStartDate,
      endDate: parsedEndDate,
      status,
      tenantId: actor.tenantId,
      createdBy: actor.userId,
    });

    await sprint.save();

    res.status(201).json({
      success: true,
      message: "Sprint created successfully",
      sprint: {
        id: sprint._id.toString(),
        name: sprint.name,
        startDate: sprint.startDate,
        endDate: sprint.endDate,
        status: sprint.status,
        tenantId: sprint.tenantId.toString(),
        createdBy: sprint.createdBy.toString(),
        taskCount: 0,
        createdAt: sprint.createdAt,
        updatedAt: sprint.updatedAt,
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function updateSprint(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
) {
  try {
    const { id } = req.params as { id: string };
    const { name, startDate, endDate, status } = req.body as {
      name?: string;
      startDate?: string;
      endDate?: string;
      status?: string;
    };

    const actor = req.user!;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        error: "Invalid sprint identifier",
      });
    }

    const filters: any = { _id: id };

    if (actor.role !== "superadmin") {
      filters.tenantId = actor.tenantId;
    }

    const sprint = await Sprint.findOne(filters);

    if (!sprint) {
      return res.status(404).json({
        success: false,
        error: "Sprint not found",
      });
    }

    // Update fields
    if (name !== undefined) {
      if (!name.trim()) {
        return res.status(400).json({
          success: false,
          error: "Sprint name cannot be empty",
        });
      }
      sprint.name = name.trim();
    }

    if (startDate !== undefined) {
      const parsedStartDate = new Date(startDate);
      if (isNaN(parsedStartDate.getTime())) {
        return res.status(400).json({
          success: false,
          error: "Invalid start date format",
        });
      }
      sprint.startDate = parsedStartDate;
    }

    if (endDate !== undefined) {
      const parsedEndDate = new Date(endDate);
      if (isNaN(parsedEndDate.getTime())) {
        return res.status(400).json({
          success: false,
          error: "Invalid end date format",
        });
      }
      sprint.endDate = parsedEndDate;
    }

    // Validate end date is after start date
    if (sprint.endDate <= sprint.startDate) {
      return res.status(400).json({
        success: false,
        error: "End date must be after start date",
      });
    }

    if (status !== undefined) {
      if (!["planned", "active", "completed"].includes(status)) {
        return res.status(400).json({
          success: false,
          error: "Status must be one of: planned, active, completed",
        });
      }
      sprint.status = status as any;
    }

    await sprint.save();

    const taskCount = await Task.countDocuments({ sprintId: sprint._id });

    res.json({
      success: true,
      message: "Sprint updated successfully",
      sprint: {
        id: sprint._id.toString(),
        name: sprint.name,
        startDate: sprint.startDate,
        endDate: sprint.endDate,
        status: sprint.status,
        tenantId: sprint.tenantId.toString(),
        createdBy: sprint.createdBy.toString(),
        taskCount,
        createdAt: sprint.createdAt,
        updatedAt: sprint.updatedAt,
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function deleteSprint(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
) {
  try {
    const { id } = req.params as { id: string };
    const actor = req.user!;

    // Only tenant admins and superadmins can delete sprints
    if (actor.role === "user") {
      return res.status(403).json({
        success: false,
        error: "Only administrators can delete sprints",
      });
    }

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        error: "Invalid sprint identifier",
      });
    }

    const filters: any = { _id: id };

    if (actor.role !== "superadmin") {
      filters.tenantId = actor.tenantId;
    }

    const sprint = await Sprint.findOne(filters);

    if (!sprint) {
      return res.status(404).json({
        success: false,
        error: "Sprint not found",
      });
    }

    // Unassign all tasks from this sprint
    await Task.updateMany(
      { sprintId: sprint._id },
      { $set: { sprintId: null } },
    );

    await sprint.deleteOne();

    res.json({
      success: true,
      message: "Sprint deleted successfully",
    });
  } catch (err) {
    next(err);
  }
}
