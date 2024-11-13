import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { CotizacionesService } from 'src/cotizaciones/services/cotizaciones.service';

@Injectable()
export class CronService {

    constructor(private cotizacionesService: CotizacionesService) { }

    // Cada un minuto en el segundo 0
    @Cron('1 0 * * * *')
    generarDatosHora() {
        try {
            this.cotizacionesService.updateAndSaveListCotizaciones();
            console.log("Ejecucion cron");
        } catch {
            throw new Error('Error en ejecucion del Cron')
        }
    }
}
