# Requirements Document

## Introduction

This feature focuses on updating the admin panel statistics section to display real-time data from MongoDB instead of hardcoded values. The "tahrirlar" (edits/modifications) section and other statistics should reflect actual data from the database, providing administrators with accurate insights into system usage and activity.

## Requirements

### Requirement 1

**User Story:** As an administrator, I want to see real-time statistics from MongoDB data in the admin panel, so that I can make informed decisions based on actual system usage.

#### Acceptance Criteria

1. WHEN the admin dashboard loads THEN the system SHALL fetch and display real statistics from MongoDB
2. WHEN displaying craftsmen count THEN the system SHALL show the actual number of craftsmen in the database
3. WHEN displaying products count THEN the system SHALL show the actual number of products in the database
4. WHEN displaying orders count THEN the system SHALL show the actual number of orders in the database
5. WHEN displaying revenue THEN the system SHALL calculate and show actual revenue from completed orders

### Requirement 2

**User Story:** As an administrator, I want to see edit/modification statistics in the tahrirlar section, so that I can track system activity and changes.

#### Acceptance Criteria

1. WHEN viewing the admin dashboard THEN the system SHALL display a tahrirlar (edits) statistics card
2. WHEN calculating edit statistics THEN the system SHALL count recent modifications to products, craftsmen, and orders
3. WHEN displaying edit count THEN the system SHALL show the number of modifications made in the last 30 days
4. IF no modifications exist THEN the system SHALL display 0 as the edit count

### Requirement 3

**User Story:** As an administrator, I want the statistics to update automatically, so that I always see current information without manual refresh.

#### Acceptance Criteria

1. WHEN the dashboard is loaded THEN the system SHALL fetch fresh data from MongoDB
2. WHEN data changes in the background THEN the statistics SHALL reflect the updated values
3. WHEN there are network errors THEN the system SHALL display appropriate error messages
4. WHEN data is loading THEN the system SHALL show loading indicators

### Requirement 4

**User Story:** As an administrator, I want to see additional meaningful statistics, so that I can better understand system performance and usage patterns.

#### Acceptance Criteria

1. WHEN displaying revenue THEN the system SHALL calculate total revenue from all completed orders
2. WHEN showing recent activity THEN the system SHALL display statistics for the last 7 days
3. WHEN calculating growth metrics THEN the system SHALL compare current period with previous period
4. WHEN displaying status information THEN the system SHALL show active vs inactive counts for craftsmen and products