using Microsoft.AspNetCore.Mvc;

namespace WhoisService.Controllers;

public class HomeController : Controller
{
    // GET
    public IActionResult Index()
    {
        return View();
    }
}