using Microsoft.AspNetCore.Mvc;
using WhoisSerivce.Buisnes;

namespace WhoisService.Controllers;

[Route("api/[controller]")]
[ApiController]
public class WhoisController : Controller
{
    [HttpGet(("getwhois/{domen}"))]
    public IActionResult GetWhois(string domen)
    {
        try
        {
            WhoisServiceService whoisServiceService = new WhoisServiceService();

            var res = whoisServiceService.GetWhois(domen);

            return Json(res);
        }
        catch (Exception e)
        {
            return Json(e.Message);
        }

    }
    
}