export interface AlertTarget {
  alertMessage?: string;
  showAlert?: boolean;
  alertClass?: string;
  alert?: AlertType;
  alertTitle?: string;
  alertMessages?: string[];
  showContactUs?: boolean;
  busy?: boolean;
  ready?: boolean;
}

export interface AlertType {
  class: string;
  icon: string;
  failure?: boolean;
}

export interface AlertMessage {
  title: string;
  message: string;
  continue?: boolean;
}
