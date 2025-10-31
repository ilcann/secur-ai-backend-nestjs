import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { TokenType } from '@prisma/client';

interface UsageDataItem {
  modelId: number;
  tokens: number;
  tokenType: TokenType;
  createdAt: Date;
  model: {
    id: number;
    name: string;
    provider: {
      id: number;
      name: string;
    };
  };
}

interface ProviderStats {
  providerId: number;
  providerName: string;
  totalTokens: number;
  totalRequests: Set<string> | number;
  totalCost: number;
}

interface ModelStats {
  modelId: number;
  modelName: string;
  providerId: number;
  providerName: string;
  totalTokens: number;
  inputTokens: number;
  outputTokens: number;
  totalRequests: Set<string> | number;
  totalCost: number;
}

interface DailyStats {
  date: string;
  totalTokens: number;
  inputTokens: number;
  outputTokens: number;
  totalRequests: Set<string> | number;
  totalCost: number;
}

interface EntityTypeStats {
  entityLabelId: number;
  entityLabelName: string;
  entityLabelKey: string;
  count: number;
}

@Injectable()
export class AnalyticsService {
  constructor(private prisma: PrismaService) {}

  async getDashboardStats() {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // General stats - not user-specific
    const usageWhereClause = {
      createdAt: { gte: thirtyDaysAgo },
    };

    // Get total usage statistics
    const usageData = await this.prisma.aiUsage.findMany({
      where: usageWhereClause,
      include: {
        model: {
          include: {
            provider: true,
          },
        },
      },
    });

    // Calculate totals
    const inputTokens = usageData
      .filter((u) => u.tokenType === TokenType.INPUT)
      .reduce((sum, u) => sum + u.tokens, 0);

    const outputTokens = usageData
      .filter((u) => u.tokenType === TokenType.OUTPUT)
      .reduce((sum, u) => sum + u.tokens, 0);

    const totalTokens = inputTokens + outputTokens;

    // Count unique model calls as requests (group by model and approximate time)
    const uniqueRequests = new Set(
      usageData.map(
        (u) => `${u.modelId}-${Math.floor(u.createdAt.getTime() / 1000)}`,
      ),
    ).size;

    // Calculate cost (simplified - using average rate)
    const avgCostPerToken = 0.00002; // $0.00002 per token
    const totalCost = totalTokens * avgCostPerToken;

    // Usage by provider
    const usageByProvider = this.calculateUsageByProvider(usageData);

    // Usage by model
    const usageByModel = this.calculateUsageByModel(usageData);

    // Usage over time (last 30 days)
    const usageOverTime = this.calculateUsageOverTime(usageData, thirtyDaysAgo);

    // Entity statistics
    const entityStats = await this.calculateEntityStats();

    return {
      totalUsage: {
        totalTokens,
        inputTokens,
        outputTokens,
        totalRequests: uniqueRequests,
        totalCost,
      },
      usageByProvider,
      usageByModel,
      usageOverTime,
      entityStats,
    };
  }

  private calculateUsageByProvider(
    usageData: UsageDataItem[],
  ): Omit<ProviderStats, 'totalRequests'>[] {
    const providerMap = new Map<number, ProviderStats>();

    usageData.forEach((usage) => {
      const providerId = usage.model.provider.id;
      const providerName = usage.model.provider.name;

      if (!providerMap.has(providerId)) {
        providerMap.set(providerId, {
          providerId,
          providerName,
          totalTokens: 0,
          totalRequests: new Set<string>(),
          totalCost: 0,
        });
      }

      const providerStats = providerMap.get(providerId)!;
      providerStats.totalTokens += usage.tokens;
      (providerStats.totalRequests as Set<string>).add(
        `${usage.modelId}-${Math.floor(usage.createdAt.getTime() / 1000)}`,
      );
      providerStats.totalCost += usage.tokens * 0.00002;
    });

    return Array.from(providerMap.values()).map((p) => ({
      ...p,
      totalRequests: (p.totalRequests as Set<string>).size,
    }));
  }

  private calculateUsageByModel(
    usageData: UsageDataItem[],
  ): Omit<ModelStats, 'totalRequests'>[] {
    const modelMap = new Map<number, ModelStats>();

    usageData.forEach((usage) => {
      const modelId = usage.model.id;

      if (!modelMap.has(modelId)) {
        modelMap.set(modelId, {
          modelId,
          modelName: usage.model.name,
          providerId: usage.model.provider.id,
          providerName: usage.model.provider.name,
          totalTokens: 0,
          inputTokens: 0,
          outputTokens: 0,
          totalRequests: new Set<string>(),
          totalCost: 0,
        });
      }

      const modelStats = modelMap.get(modelId)!;
      modelStats.totalTokens += usage.tokens;

      if (usage.tokenType === TokenType.INPUT) {
        modelStats.inputTokens += usage.tokens;
      } else {
        modelStats.outputTokens += usage.tokens;
      }

      (modelStats.totalRequests as Set<string>).add(
        `${usage.modelId}-${Math.floor(usage.createdAt.getTime() / 1000)}`,
      );
      modelStats.totalCost += usage.tokens * 0.00002;
    });

    return Array.from(modelMap.values())
      .map((m) => ({
        ...m,
        totalRequests: (m.totalRequests as Set<string>).size,
      }))
      .sort((a, b) => b.totalTokens - a.totalTokens);
  }

  private calculateUsageOverTime(
    usageData: UsageDataItem[],
    startDate: Date,
  ): Omit<DailyStats, 'totalRequests'>[] {
    const dailyStats = new Map<string, DailyStats>();

    // Initialize all dates in range
    const currentDate = new Date(startDate);
    const today = new Date();

    while (currentDate <= today) {
      const dateKey = currentDate.toISOString().split('T')[0];
      dailyStats.set(dateKey, {
        date: dateKey,
        totalTokens: 0,
        inputTokens: 0,
        outputTokens: 0,
        totalRequests: new Set<string>(),
        totalCost: 0,
      });
      currentDate.setDate(currentDate.getDate() + 1);
    }

    // Populate with actual data
    usageData.forEach((usage) => {
      const dateKey = usage.createdAt.toISOString().split('T')[0];

      if (dailyStats.has(dateKey)) {
        const dayStats = dailyStats.get(dateKey)!;
        dayStats.totalTokens += usage.tokens;

        if (usage.tokenType === TokenType.INPUT) {
          dayStats.inputTokens += usage.tokens;
        } else {
          dayStats.outputTokens += usage.tokens;
        }

        (dayStats.totalRequests as Set<string>).add(
          `${usage.modelId}-${Math.floor(usage.createdAt.getTime() / 1000)}`,
        );
        dayStats.totalCost += usage.tokens * 0.00002;
      }
    });

    return Array.from(dailyStats.values()).map((d) => ({
      ...d,
      totalRequests: (d.totalRequests as Set<string>).size,
    }));
  }

  private async calculateEntityStats() {
    // General stats - no user filtering
    // Total entities detected
    const totalEntitiesDetected = await this.prisma.messageEntity.count();

    // Count masked vs unmasked
    const totalMasked = await this.prisma.messageEntity.count({
      where: {
        isMasked: 'MASK',
      },
    });

    const totalUnmasked = totalEntitiesDetected - totalMasked;

    // Get entities by type - fixed ambiguous column reference
    const entitiesByType = await this.prisma.messageEntity.groupBy({
      by: ['entityLabelId'],
      _count: {
        entityLabelId: true,
      },
      orderBy: {
        _count: {
          entityLabelId: 'desc',
        },
      },
      take: 10,
    });

    // Get label details
    const labelIds = entitiesByType.map((e) => e.entityLabelId);
    const labels = await this.prisma.entityLabel.findMany({
      where: {
        id: {
          in: labelIds,
        },
      },
    });

    const byType = entitiesByType.map((e) => {
      const label = labels.find((l) => l.id === e.entityLabelId);
      return {
        entityLabelId: e.entityLabelId,
        entityLabelName: label?.name || 'Unknown',
        entityLabelKey: label?.key || 'UNKNOWN',
        count: e._count.entityLabelId,
      };
    });

    // Calculate category stats (simplified grouping)
    const byCategory = this.groupByCategory(byType);

    return {
      totalEntitiesDetected,
      totalMasked,
      totalUnmasked,
      byType,
      byCategory,
    };
  }

  private groupByCategory(
    byType: EntityTypeStats[],
  ): { category: string; count: number; percentage: number }[] {
    const categories: Record<string, string[]> = {
      'Personal Information': [
        'PERSON',
        'SSN',
        'DATE_OF_BIRTH',
        'NATIONAL_ID',
        'PASSPORT',
        'DRIVER_LICENSE',
        'MARITAL_STATUS',
      ],
      'Contact Information': [
        'EMAIL',
        'PHONE',
        'PHONE_NUMBER',
        'ADDRESS',
        'IP_ADDRESS',
        'URL',
      ],
      'Financial Information': [
        'CREDIT_CARD',
        'IBAN',
        'CRYPTO',
        'BANK_ACCOUNT',
        'SALARY',
        'SWIFT',
      ],
    };

    const categoryCounts: Record<string, number> = {
      'Personal Information': 0,
      'Contact Information': 0,
      'Financial Information': 0,
    };

    byType.forEach((type) => {
      let categorized = false;
      for (const [category, keys] of Object.entries(categories)) {
        // Check if the key matches (case-insensitive partial match)
        if (
          keys.some((key) =>
            type.entityLabelKey.toUpperCase().includes(key.toUpperCase()),
          )
        ) {
          categoryCounts[category] += type.count;
          categorized = true;
          break;
        }
      }
      // If not categorized, add to Personal Information as fallback
      if (!categorized) {
        categoryCounts['Personal Information'] += type.count;
      }
    });

    const total = Object.values(categoryCounts).reduce(
      (sum, count) => sum + count,
      0,
    );

    return Object.entries(categoryCounts)
      .map(([category, count]) => ({
        category,
        count,
        percentage:
          total > 0 ? parseFloat(((count / total) * 100).toFixed(1)) : 0,
      }))
      .filter((cat) => cat.count > 0); // Only return categories with data
  }
}
