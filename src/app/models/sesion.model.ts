export interface IUsuarioSesion {
  id:        string;
  nombre:    string;
  apellidos: string;
  email:     string;
  [key: string]: unknown;
}

export interface ILoginResult {
  usuario:              IUsuarioSesion;
  debeCambiarPassword:  boolean;
}
