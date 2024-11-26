import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { CotizacionesService } from 'src/cotizaciones/services/cotizaciones.service';
import { IndiceService } from 'src/indices/services/indice.service';

@Injectable()
export class CronService {

    constructor(private cotizacionesService: CotizacionesService, private indiceService: IndiceService) { }

    // Cada un minuto en el segundo 5
    /**
     * cotizaciones
     * Ecuacion de indice bursatil mio
     */
    @Cron('5 0 * * * *')
    async generateDataEveryHour() {
        try {
            await this.cotizacionesService.updateAndSaveListCotizaciones();
            await this.indiceService.verifyIfExistIndice()
            console.log("Ejecucion cron 1 hora");
        } catch (error) {
            console.error('Error en la ejecución del Cron:', error);
            throw new Error('Error en ejecucion del Cron')
        }
    }

    // Publicar mi indice bursatil
    @Cron('0 5 * * * *')
    async postMyIndiceBursatil() {
        try {
            await this.indiceService.postIndiceBursatilInGempresa();
            console.log("Ejecucion cron 1 hora y 5m");
        } catch (error) {
            console.error('Error en la ejecución del Cron:', error);
            throw new Error('Error en ejecucion del Cron')
        }
    }
}