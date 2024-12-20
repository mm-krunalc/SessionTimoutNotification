using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;

namespace SessionTimeout.Controllers
{
    public class LoginController : Controller
    {
        private readonly IConfiguration _configuration;

        public LoginController(IConfiguration configuration)
        {
            _configuration = configuration;
        }

        public IActionResult Index()
        {
            return View();
        }

        public IActionResult Logout()
        {
            return RedirectToAction("Index");
        }

        public IActionResult KeepAlive()
        {
            return Json(true);
        }
    }
}