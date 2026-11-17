export type DetectedColumnType = 'numeric' | 'boolean' | 'date' | 'categorical' | 'text' | 'empty';

export interface ColumnStatistics {
  mean?: number | null;
  median?: number | null;
  minimum?: number | null;
  maximum?: number | null;
  standard_deviation?: number | null;
}

export interface ColumnDateStatistics {
  earliest_date?: string;
  latest_date?: string;
}

export interface ColumnProfile {
  data_type: string;
  detected_type: DetectedColumnType;
  missing_values: number;
  missing_percentage: number;
  unique_values: number;
  unique_percentage?: number;
  top_values?: Record<string, number>;
  statistics?: ColumnStatistics;
  date_statistics?: ColumnDateStatistics;
}

export interface DatasetProfile {
  total_rows: number;
  total_columns: number;
  duplicate_rows: number;
  columns: Record<string, ColumnProfile>;
}

export interface DataQualityReport {
  total_cells: number;
  missing_cells: number;
  missing_percentage: number;
  duplicate_rows: number;
  duplicate_percentage: number;
  columns_with_missing_values: string[];
  empty_columns: string[];
  constant_columns: string[];
  recommendations: string[];
  total_rows?: number;
  total_columns?: number;
}

export interface NumericColumnAnalysis {
  count: number;
  sum: number;
  average: number | null;
  minimum: number | null;
  maximum: number | null;
  median: number | null;
  standard_deviation: number | null;
}

export interface CategoricalColumnAnalysis {
  unique_values: number;
  value_distribution: Record<string, number>;
}

export interface DateColumnAnalysis {
  earliest_date: string;
  latest_date: string;
  date_range_days: number;
}

export interface AnalyticsSummary {
  total_records: number;
  total_columns: number;
  numeric_columns: string[];
  categorical_columns: string[];
  date_columns: string[];
  text_columns: string[];
}

export interface AnalyticsReport {
  dataset_summary: AnalyticsSummary;
  numeric_analysis: Record<string, NumericColumnAnalysis>;
  categorical_analysis: Record<string, CategoricalColumnAnalysis>;
  date_analysis: Record<string, DateColumnAnalysis>;
}

export interface ChartData {
  title: string;
  category_column?: string;
  numeric_column?: string;
  date_column?: string;
  labels: string[];
  values: number[];
}

export interface VisualizationsReport {
  bar_charts: ChartData[];
  pie_charts: ChartData[];
  histograms: ChartData[];
  line_charts: ChartData[];
}

export interface DatasetUploadResponse {
  message: string;
  filename: string;
  profile: DatasetProfile;
  data_quality: DataQualityReport;
  analytics: AnalyticsReport;
  visualizations: VisualizationsReport;
  insights: string[];
  preview: Record<string, any>[];
}

export interface ApiHealthResponse {
  status: string;
  application: string;
}

export interface ApiInfoResponse {
  application: string;
  version: string;
  description: string;
  available_features: string[];
}
