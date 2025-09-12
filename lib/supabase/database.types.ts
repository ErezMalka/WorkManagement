export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          user_id: string
          full_name: string
          email: string
          phone: string | null
          role: 'employee' | 'manager' | 'payroll' | 'admin'
          manager_id: string | null
          branch_id: number | null
          start_date: string
          active: boolean
          notify_channel: 'email' | 'whatsapp' | 'both' | 'none'
          quiet_hours: Json
          consent_whatsapp: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          user_id: string
          full_name: string
          email: string
          phone?: string | null
          role?: 'employee' | 'manager' | 'payroll' | 'admin'
          manager_id?: string | null
          branch_id?: number | null
          start_date?: string
          active?: boolean
          notify_channel?: 'email' | 'whatsapp' | 'both' | 'none'
          quiet_hours?: Json
          consent_whatsapp?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          user_id?: string
          full_name?: string
          email?: string
          phone?: string | null
          role?: 'employee' | 'manager' | 'payroll' | 'admin'
          manager_id?: string | null
          branch_id?: number | null
          start_date?: string
          active?: boolean
          notify_channel?: 'email' | 'whatsapp' | 'both' | 'none'
          quiet_hours?: Json
          consent_whatsapp?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      timesheets: {
        Row: {
          id: string
          employee_id: string
          month: string
          period_start: string
          period_end: string
          status: 'draft' | 'submitted' | 'approved' | 'rejected' | 'paid'
          total_regular_hours: number
          total_ot1_hours: number
          total_ot2_hours: number
          total_night_hours: number
          total_holiday_hours: number
          submitted_at: string | null
          approved_by: string | null
          approved_at: string | null
          rejected_by: string | null
          rejected_at: string | null
          rejection_reason: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          employee_id: string
          month: string
          period_start: string
          period_end: string
          status?: 'draft' | 'submitted' | 'approved' | 'rejected' | 'paid'
          total_regular_hours?: number
          total_ot1_hours?: number
          total_ot2_hours?: number
          total_night_hours?: number
          total_holiday_hours?: number
          submitted_at?: string | null
          approved_by?: string | null
          approved_at?: string | null
          rejected_by?: string | null
          rejected_at?: string | null
          rejection_reason?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          employee_id?: string
          month?: string
          period_start?: string
          period_end?: string
          status?: 'draft' | 'submitted' | 'approved' | 'rejected' | 'paid'
          total_regular_hours?: number
          total_ot1_hours?: number
          total_ot2_hours?: number
          total_night_hours?: number
          total_holiday_hours?: number
          submitted_at?: string | null
          approved_by?: string | null
          approved_at?: string | null
          rejected_by?: string | null
          rejected_at?: string | null
          rejection_reason?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      time_entries: {
        Row: {
          id: string
          timesheet_id: string
          date: string
          start_time: string
          end_time: string
          break_minutes: number
          regular_hours: number
          ot1_hours: number
          ot2_hours: number
          night_hours: number
          holiday_hours: number
          comment: string | null
          attachments: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          timesheet_id: string
          date: string
          start_time: string
          end_time: string
          break_minutes?: number
          regular_hours?: number
          ot1_hours?: number
          ot2_hours?: number
          night_hours?: number
          holiday_hours?: number
          comment?: string | null
          attachments?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          timesheet_id?: string
          date?: string
          start_time?: string
          end_time?: string
          break_minutes?: number
          regular_hours?: number
          ot1_hours?: number
          ot2_hours?: number
          night_hours?: number
          holiday_hours?: number
          comment?: string | null
          attachments?: Json
          created_at?: string
          updated_at?: string
        }
      }
      leave_requests: {
        Row: {
          id: string
          employee_id: string
          month: string
          type: 'annual' | 'sick' | 'unpaid' | 'other'
          start_date: string
          end_date: string
          days_requested: number
          status: 'pending' | 'approved' | 'rejected' | 'cancelled'
          reason: string | null
          attachments: Json
          decided_by: string | null
          decided_at: string | null
          decision_comment: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          employee_id: string
          month: string
          type: 'annual' | 'sick' | 'unpaid' | 'other'
          start_date: string
          end_date: string
          days_requested: number
          status?: 'pending' | 'approved' | 'rejected' | 'cancelled'
          reason?: string | null
          attachments?: Json
          decided_by?: string | null
          decided_at?: string | null
          decision_comment?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          employee_id?: string
          month?: string
          type?: 'annual' | 'sick' | 'unpaid' | 'other'
          start_date?: string
          end_date?: string
          days_requested?: number
          status?: 'pending' | 'approved' | 'rejected' | 'cancelled'
          reason?: string | null
          attachments?: Json
          decided_by?: string | null
          decided_at?: string | null
          decision_comment?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      leave_balances: {
        Row: {
          id: string
          employee_id: string
          year: number
          annual_days_accrued: number
          annual_days_used: number
          sick_days_accrued: number
          sick_days_used: number
          carryover: number
          updated_at: string
        }
        Insert: {
          id?: string
          employee_id: string
          year: number
          annual_days_accrued?: number
          annual_days_used?: number
          sick_days_accrued?: number
          sick_days_used?: number
          carryover?: number
          updated_at?: string
        }
        Update: {
          id?: string
          employee_id?: string
          year?: number
          annual_days_accrued?: number
          annual_days_used?: number
          sick_days_accrued?: number
          sick_days_used?: number
          carryover?: number
          updated_at?: string
        }
      }
      payslips: {
        Row: {
          id: string
          employee_id: string
          period: string
          file_url: string
          file_name: string
          checksum: string | null
          uploaded_by: string
          uploaded_at: string
          download_count: number
          read_receipt_ts: string | null
        }
        Insert: {
          id?: string
          employee_id: string
          period: string
          file_url: string
          file_name: string
          checksum?: string | null
          uploaded_by: string
          uploaded_at?: string
          download_count?: number
          read_receipt_ts?: string | null
        }
        Update: {
          id?: string
          employee_id?: string
          period?: string
          file_url?: string
          file_name?: string
          checksum?: string | null
          uploaded_by?: string
          uploaded_at?: string
          download_count?: number
          read_receipt_ts?: string | null
        }
      }
      reminder_runs: {
        Row: {
          id: string
          run_ts: string
          period: string
          channel: 'email' | 'whatsapp' | 'both' | 'none'
          audience_count: number
          sent_count: number
          errors_count: number
          details: Json
          created_at: string
        }
        Insert: {
          id?: string
          run_ts?: string
          period: string
          channel: 'email' | 'whatsapp' | 'both' | 'none'
          audience_count?: number
          sent_count?: number
          errors_count?: number
          details?: Json
          created_at?: string
        }
        Update: {
          id?: string
          run_ts?: string
          period?: string
          channel?: 'email' | 'whatsapp' | 'both' | 'none'
          audience_count?: number
          sent_count?: number
          errors_count?: number
          details?: Json
          created_at?: string
        }
      }
      audit_log: {
        Row: {
          id: string
          ts: string
          actor_id: string | null
          action: string
          entity: string
          entity_id: string | null
          diff: Json
        }
        Insert: {
          id?: string
          ts?: string
          actor_id?: string | null
          action: string
          entity: string
          entity_id?: string | null
          diff?: Json
        }
        Update: {
          id?: string
          ts?: string
          actor_id?: string | null
          action?: string
          entity?: string
          entity_id?: string | null
          diff?: Json
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
