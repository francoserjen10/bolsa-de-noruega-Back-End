import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';

@Injectable()
export class CronService {

    constructor() { }

    // Cada un minuto en el segundo 0
    @Cron('0 * * * * *')
    generarDatosHora() {
    }
}
