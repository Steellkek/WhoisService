using Microsoft.AspNetCore.Mvc;

namespace WhoisService.Controllers;

[Route("api/[controller]")]
[ApiController]
public class WhoisController : Controller
{
    [Route("getwhois")]
    [HttpGet]
    public IActionResult GetWhois(string domen = "kai.ru")
    {            
        List<string> whoisServers = null;
        //разбиваем домен на уровни
        string[] domainLevels = domen.Trim().Split('.');
        //по шагам пытаемся найти WHOIS-сервер для доменной зоны различного уровня от большей к меньшей
        for (int a = 1; a < domainLevels.Length; a++){
            /*
             * Если требуется информация по домену test.some-name.ru.com,
             * то сначала попытаемся найти WHOIS-сервера для some-name.ru.com,
             * после для ru.com и если всё ещё не найдём, то для com
            */
            string zone = string.Join(".", domainLevels, a, domainLevels.Length - a);
            whoisServers = WhoisSerivce.Buisnes.WhoisService.GetWhoisServers(zone);
            //если нашли WHOIS-сервер, то поиск прекращаем
            if (whoisServers.Count > 0)
                break;
        }
        if (whoisServers == null || whoisServers.Count == 0)
        {
            return Json(domen + "\r\n----------------\r\nНеизвестная доменная зона");
        }
        else
        {
            var result_TB = "";
            foreach (string whoisServer in whoisServers)
                result_TB += WhoisSerivce.Buisnes.WhoisService.Lookup(whoisServer, domen);
            return Json(result_TB);
        }
    }
    
}