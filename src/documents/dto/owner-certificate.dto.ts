export class OwnerCertificateDto {
  amountWords!: string; // Monto en palabras (ej: "TRES MILLONES OCHOCIENTOS MIL PESOS MCTE")
  amountNumber!: number; // Monto en número (ej: 3800000)
  vehicleIds!: number[]; // IDs de vehículos seleccionados para incluir en la certificación
}
