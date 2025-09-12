-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create custom types
CREATE TYPE user_role AS ENUM ('employee', 'manager', 'payroll', 'admin');
CREATE TYPE timesheet_status AS ENUM ('draft', 'submitted', 'approved', 'rejected', 'paid');
CREATE TYPE leave_type AS ENUM ('annual', 'sick', 'unpaid', 'other');
CREATE TYPE leave_status AS ENUM ('pending', 'approved', 'rejected', 'cancelled');
CREATE TYPE notification_channel AS ENUM ('email', 'whatsapp', 'both', 'none');

-- Profiles table (extends auth.users)
CREATE TABLE profiles (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    role user_role DEFAULT 'employee' NOT NULL,
    manager_id UUID REFERENCES profiles(user_id),
    branch_id INTEGER,
    start_date DATE NOT NULL DEFAULT CURRENT_DATE,
    active BOOLEAN DEFAULT true NOT NULL,
    notify_channel notification_channel DEFAULT 'email' NOT NULL,
    quiet_hours JSONB DEFAULT '{"start": "22:00", "end": "08:00"}'::jsonb,
    consent_whatsapp BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Create indexes for profiles
CREATE INDEX idx_profiles_manager_id ON profiles(manager_id);
CREATE INDEX idx_profiles_role ON profiles(role);
CREATE INDEX idx_profiles_active ON profiles(active);
CREATE INDEX idx_profiles_email ON profiles(email);

-- Timesheets table
CREATE TABLE timesheets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    employee_id UUID REFERENCES profiles(user_id) NOT NULL,
    month VARCHAR(7) NOT NULL, -- Format: YYYY-MM
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    status timesheet_status DEFAULT 'draft' NOT NULL,
    total_regular_hours DECIMAL(10,2) DEFAULT 0,
    total_ot1_hours DECIMAL(10,2) DEFAULT 0,
    total_ot2_hours DECIMAL(10,2) DEFAULT 0,
    total_night_hours DECIMAL(10,2) DEFAULT 0,
    total_holiday_hours DECIMAL(10,2) DEFAULT 0,
    submitted_at TIMESTAMPTZ,
    approved_by UUID REFERENCES profiles(user_id),
    approved_at TIMESTAMPTZ,
    rejected_by UUID REFERENCES profiles(user_id),
    rejected_at TIMESTAMPTZ,
    rejection_reason TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    UNIQUE(employee_id, month)
);

-- Create indexes for timesheets
CREATE INDEX idx_timesheets_employee_id ON timesheets(employee_id);
CREATE INDEX idx_timesheets_month ON timesheets(month);
CREATE INDEX idx_timesheets_status ON timesheets(status);

-- Time entries table
CREATE TABLE time_entries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    timesheet_id UUID REFERENCES timesheets(id) ON DELETE CASCADE NOT NULL,
    date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    break_minutes INTEGER DEFAULT 0,
    regular_hours DECIMAL(5,2) DEFAULT 0,
    ot1_hours DECIMAL(5,2) DEFAULT 0,
    ot2_hours DECIMAL(5,2) DEFAULT 0,
    night_hours DECIMAL(5,2) DEFAULT 0,
    holiday_hours DECIMAL(5,2) DEFAULT 0,
    comment TEXT,
    attachments JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    UNIQUE(timesheet_id, date)
);

-- Create indexes for time_entries
CREATE INDEX idx_time_entries_timesheet_id ON time_entries(timesheet_id);
CREATE INDEX idx_time_entries_date ON time_entries(date);

-- Leave requests table
CREATE TABLE leave_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    employee_id UUID REFERENCES profiles(user_id) NOT NULL,
    month VARCHAR(7) NOT NULL, -- Format: YYYY-MM
    type leave_type NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    days_requested DECIMAL(5,2) NOT NULL,
    status leave_status DEFAULT 'pending' NOT NULL,
    reason TEXT,
    attachments JSONB DEFAULT '[]'::jsonb,
    decided_by UUID REFERENCES profiles(user_id),
    decided_at TIMESTAMPTZ,
    decision_comment TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Create indexes for leave_requests
CREATE INDEX idx_leave_requests_employee_id ON leave_requests(employee_id);
CREATE INDEX idx_leave_requests_month ON leave_requests(month);
CREATE INDEX idx_leave_requests_status ON leave_requests(status);
CREATE INDEX idx_leave_requests_dates ON leave_requests(start_date, end_date);

-- Leave balances table
CREATE TABLE leave_balances (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    employee_id UUID REFERENCES profiles(user_id) NOT NULL,
    year INTEGER NOT NULL,
    annual_days_accrued DECIMAL(5,2) DEFAULT 0,
    annual_days_used DECIMAL(5,2) DEFAULT 0,
    sick_days_accrued DECIMAL(5,2) DEFAULT 0,
    sick_days_used DECIMAL(5,2) DEFAULT 0,
    carryover DECIMAL(5,2) DEFAULT 0,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    UNIQUE(employee_id, year)
);

-- Create indexes for leave_balances
CREATE INDEX idx_leave_balances_employee_id ON leave_balances(employee_id);
CREATE INDEX idx_leave_balances_year ON leave_balances(year);

-- Payslips table
CREATE TABLE payslips (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    employee_id UUID REFERENCES profiles(user_id) NOT NULL,
    period VARCHAR(7) NOT NULL, -- Format: YYYY-MM
    file_url TEXT NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    checksum VARCHAR(64),
    uploaded_by UUID REFERENCES profiles(user_id) NOT NULL,
    uploaded_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    download_count INTEGER DEFAULT 0,
    read_receipt_ts TIMESTAMPTZ,
    UNIQUE(employee_id, period)
);

-- Create indexes for payslips
CREATE INDEX idx_payslips_employee_id ON payslips(employee_id);
CREATE INDEX idx_payslips_period ON payslips(period);

-- Reminder runs table
CREATE TABLE reminder_runs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    run_ts TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    period VARCHAR(7) NOT NULL, -- Format: YYYY-MM
    channel notification_channel NOT NULL,
    audience_count INTEGER DEFAULT 0,
    sent_count INTEGER DEFAULT 0,
    errors_count INTEGER DEFAULT 0,
    details JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Create indexes for reminder_runs
CREATE INDEX idx_reminder_runs_period ON reminder_runs(period);
CREATE INDEX idx_reminder_runs_channel ON reminder_runs(channel);
CREATE INDEX idx_reminder_runs_run_ts ON reminder_runs(run_ts);

-- Audit log table
CREATE TABLE audit_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ts TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    actor_id UUID REFERENCES profiles(user_id),
    action VARCHAR(100) NOT NULL,
    entity VARCHAR(100) NOT NULL,
    entity_id UUID,
    diff JSONB DEFAULT '{}'::jsonb
);

-- Create indexes for audit_log
CREATE INDEX idx_audit_log_ts ON audit_log(ts);
CREATE INDEX idx_audit_log_actor_id ON audit_log(actor_id);
CREATE INDEX idx_audit_log_entity ON audit_log(entity);
CREATE INDEX idx_audit_log_entity_id ON audit_log(entity_id);

-- Create trigger for updated_at columns
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_timesheets_updated_at BEFORE UPDATE ON timesheets
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_time_entries_updated_at BEFORE UPDATE ON time_entries
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_leave_requests_updated_at BEFORE UPDATE ON leave_requests
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- RLS (Row Level Security) Policies

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE timesheets ENABLE ROW LEVEL SECURITY;
ALTER TABLE time_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE leave_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE leave_balances ENABLE ROW LEVEL SECURITY;
ALTER TABLE payslips ENABLE ROW LEVEL SECURITY;
ALTER TABLE reminder_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view their own profile"
    ON profiles FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile (limited)"
    ON profiles FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id AND role = (SELECT role FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY "Managers can view their team profiles"
    ON profiles FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM profiles p
            WHERE p.user_id = auth.uid()
            AND (p.role IN ('manager', 'payroll', 'admin')
                OR profiles.manager_id = auth.uid())
        )
    );

CREATE POLICY "Payroll and Admin can view all profiles"
    ON profiles FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE user_id = auth.uid()
            AND role IN ('payroll', 'admin')
        )
    );

CREATE POLICY "Admin can update all profiles"
    ON profiles FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE user_id = auth.uid()
            AND role = 'admin'
        )
    );

-- Timesheets policies
CREATE POLICY "Employees can view their own timesheets"
    ON timesheets FOR SELECT
    USING (employee_id = auth.uid());

CREATE POLICY "Employees can create their own timesheets"
    ON timesheets FOR INSERT
    WITH CHECK (employee_id = auth.uid());

CREATE POLICY "Employees can update their own draft/rejected timesheets"
    ON timesheets FOR UPDATE
    USING (employee_id = auth.uid() AND status IN ('draft', 'rejected'))
    WITH CHECK (employee_id = auth.uid());

CREATE POLICY "Managers can view team timesheets"
    ON timesheets FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM profiles emp
            JOIN profiles mgr ON emp.manager_id = mgr.user_id
            WHERE emp.user_id = timesheets.employee_id
            AND mgr.user_id = auth.uid()
        )
    );

CREATE POLICY "Managers can update team timesheets status"
    ON timesheets FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM profiles emp
            JOIN profiles mgr ON emp.manager_id = mgr.user_id
            WHERE emp.user_id = timesheets.employee_id
            AND mgr.user_id = auth.uid()
        )
    );

CREATE POLICY "Payroll and Admin can view all timesheets"
    ON timesheets FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE user_id = auth.uid()
            AND role IN ('payroll', 'admin')
        )
    );

-- Time entries policies
CREATE POLICY "Users can manage entries for their timesheets"
    ON time_entries FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM timesheets
            WHERE timesheets.id = time_entries.timesheet_id
            AND timesheets.employee_id = auth.uid()
        )
    );

CREATE POLICY "Managers can view team entries"
    ON time_entries FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM timesheets t
            JOIN profiles emp ON t.employee_id = emp.user_id
            JOIN profiles mgr ON emp.manager_id = mgr.user_id
            WHERE t.id = time_entries.timesheet_id
            AND mgr.user_id = auth.uid()
        )
    );

CREATE POLICY "Payroll and Admin can manage all entries"
    ON time_entries FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE user_id = auth.uid()
            AND role IN ('payroll', 'admin')
        )
    );

-- Leave requests policies
CREATE POLICY "Employees can manage their own leave requests"
    ON leave_requests FOR ALL
    USING (employee_id = auth.uid());

CREATE POLICY "Managers can view and update team leave requests"
    ON leave_requests FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM profiles emp
            JOIN profiles mgr ON emp.manager_id = mgr.user_id
            WHERE emp.user_id = leave_requests.employee_id
            AND mgr.user_id = auth.uid()
        )
    );

CREATE POLICY "Payroll and Admin can manage all leave requests"
    ON leave_requests FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE user_id = auth.uid()
            AND role IN ('payroll', 'admin')
        )
    );

-- Leave balances policies
CREATE POLICY "Employees can view their own leave balances"
    ON leave_balances FOR SELECT
    USING (employee_id = auth.uid());

CREATE POLICY "Managers can view team leave balances"
    ON leave_balances FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM profiles emp
            JOIN profiles mgr ON emp.manager_id = mgr.user_id
            WHERE emp.user_id = leave_balances.employee_id
            AND mgr.user_id = auth.uid()
        )
    );

CREATE POLICY "Payroll and Admin can manage all leave balances"
    ON leave_balances FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE user_id = auth.uid()
            AND role IN ('payroll', 'admin')
        )
    );

-- Payslips policies
CREATE POLICY "Employees can view their own payslips"
    ON payslips FOR SELECT
    USING (employee_id = auth.uid());

CREATE POLICY "Payroll and Admin can manage all payslips"
    ON payslips FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE user_id = auth.uid()
            AND role IN ('payroll', 'admin')
        )
    );

-- Reminder runs policies
CREATE POLICY "Payroll and Admin can view reminder runs"
    ON reminder_runs FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE user_id = auth.uid()
            AND role IN ('payroll', 'admin')
        )
    );

CREATE POLICY "System can create reminder runs"
    ON reminder_runs FOR INSERT
    WITH CHECK (true);

-- Audit log policies
CREATE POLICY "Payroll and Admin can view audit logs"
    ON audit_log FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE user_id = auth.uid()
            AND role IN ('payroll', 'admin')
        )
    );

CREATE POLICY "System can create audit logs"
    ON audit_log FOR INSERT
    WITH CHECK (true);

-- Create storage bucket for payslips
INSERT INTO storage.buckets (id, name, public)
VALUES ('payslips', 'payslips', false);

-- Storage policies for payslips bucket
CREATE POLICY "Employees can view their own payslips files"
    ON storage.objects FOR SELECT
    USING (
        bucket_id = 'payslips' AND
        (
            auth.uid() IN (
                SELECT employee_id FROM payslips
                WHERE file_url LIKE '%' || storage.objects.name
            )
            OR
            EXISTS (
                SELECT 1 FROM profiles
                WHERE user_id = auth.uid()
                AND role IN ('payroll', 'admin')
            )
        )
    );

CREATE POLICY "Payroll and Admin can upload payslips"
    ON storage.objects FOR INSERT
    WITH CHECK (
        bucket_id = 'payslips' AND
        EXISTS (
            SELECT 1 FROM profiles
            WHERE user_id = auth.uid()
            AND role IN ('payroll', 'admin')
        )
    );

CREATE POLICY "Payroll and Admin can delete payslips"
    ON storage.objects FOR DELETE
    USING (
        bucket_id = 'payslips' AND
        EXISTS (
            SELECT 1 FROM profiles
            WHERE user_id = auth.uid()
            AND role IN ('payroll', 'admin')
        )
    );
