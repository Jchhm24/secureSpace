export interface ConfirmActionModalConfig {
  title: string;
  message: string;
  iconType: 'warning' | 'info' | 'error' | 'success';
  buttonText: string;
  isOpen?: boolean;
  enabled?: boolean;
  disabledText?: string;
}

