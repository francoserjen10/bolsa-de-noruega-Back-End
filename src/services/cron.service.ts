import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { CotizacionesService } from 'src/cotizaciones/services/cotizaciones.service';

@Injectable()
export class CronService {

    constructor(private cotizacionesService: CotizacionesService) { }

    // Cada un minuto en el segundo 0
    @Cron('5 0 * * * *')
    async generarDatosHora() {
        try {
            await this.cotizacionesService.updateAndSaveListCotizaciones();
            await this.cotizacionesService.getLastCotizacionOfAllEmpresas();
            console.log("Ejecucion cron");
        } catch (error) {
            console.error('Error en la ejecución del Cron:', error);
            throw new Error('Error en ejecucion del Cron')
        }
    }
}
