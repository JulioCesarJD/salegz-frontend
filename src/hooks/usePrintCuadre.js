import * as commonService from '../services/commonService';
import * as cuadresService from '../services/cuadresService';
import { printCuadre } from '../utils/print/printCuadre';   

export function usePrintCuadre() {
  const handleImprimir = async (cuadreId) => {
    try {
      const [cuadre, empresa, control] = await Promise.all([
        cuadresService.getCuadreById(cuadreId),
        commonService.getEmpresa(),
        commonService.getControlesEmpresa(),
      ]);
      printCuadre(cuadre, empresa, control);
    } catch (e) {
      console.error(e);
    }
  };
  
  return { handleImprimir };
}