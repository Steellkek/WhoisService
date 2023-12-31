﻿using System.Globalization;
using System.Net;
using System.Net.Sockets;
using System.Text;
using System.Text.RegularExpressions;
using System.Xml;

namespace WhoisSerivce.Buisnes;

public class WhoisServiceService
{        
    private XmlDocument _serverList = null;

    public string GetWhois(string domen)
    {
        List<string> whoisServers = null;
        
        if (IsIP(domen))
        {
            whoisServers = GetWhoisServerForIP(domen);
            
            if (whoisServers == null || whoisServers.Count == 0)
            {
                return domen + "\r\n----------------\r\nНеизвестный адрес";
            }
        }
        else
        {
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
                whoisServers = GetWhoisServers(zone);
                //если нашли WHOIS-сервер, то поиск прекращаем
                if (whoisServers.Count > 0)
                    break;
            }
            
            if (whoisServers == null || whoisServers.Count == 0)
            {
                return domen + "\r\n----------------\r\nНеизвестная доменная зона";
            }
        }

        var result_TB = "";
        foreach (string whoisServer in whoisServers)
        {
            result_TB += Lookup(whoisServer, domen);
        }
        
        return result_TB;
    }

    private List<string> GetWhoisServers(string domainZone){
        if (_serverList == null){
            _serverList = new XmlDocument();
            //загружаем XML если ранее он не был загружен
            _serverList.Load("whois-server-list.xml");
        }
        List<string> result = new List<string>();
        //определяем функцию для рекурсивной обработки XML
        Action<XmlNodeList> find = null;
        find = new Action<XmlNodeList>((nodes) =>{
            foreach (XmlNode node in nodes)
                if (node.Name == "domain"){
                    //находим в XML документе интересующую нас зону
                    if (node.Attributes["name"] != null && node.Attributes["name"].Value.ToLower() == domainZone){
                        foreach (XmlNode n in node.ChildNodes)
                            //забираем все адреса серверов, по которым можно получить данные о домене в требуемой зоне
                            if (n.Name == "whoisServer"){
                                XmlAttribute host = n.Attributes["host"];
                                if (host != null && host.Value.Length > 0 && !result.Contains(host.Value))
                                    result.Add(host.Value);
                            }
                    }
                    find(node.ChildNodes);
                }
        });
        var x = _serverList["domainList"].ChildNodes;
        find(_serverList["domainList"].ChildNodes);
        return result;
    }

    private List<string> GetWhoisServerForIP(string ip)
    {
        const string whoisServer = "whois.iana.org";
        var result = new StringBuilder();
        try
        {
            using (TcpClient tcpClient = new TcpClient())
            {
                tcpClient.Connect(whoisServer.Trim(), 43);
                byte[] domainQueryBytes = Encoding.ASCII.GetBytes(ip + "\r\n");
                using (Stream stream = tcpClient.GetStream())
                {
                    //отправляем запрос на сервер WHOIS
                    stream.Write(domainQueryBytes, 0, domainQueryBytes.Length);
                    //читаем ответ в формате UTF8, так как некоторые национальные домены содержат информацию на местном языке
                    using (StreamReader sr = new StreamReader(tcpClient.GetStream(), Encoding.UTF8))
                    {
                        string row;
                        while ((row = sr.ReadLine()) != null)
                            result.AppendLine(row);
                    }
                }
            }

            throw new Exception();
            
            Regex regex = new Regex(@"whois\.\S*");
            MatchCollection matches = regex.Matches(result.ToString());
            var res = matches.Select(x => x.ToString()).Distinct().ToList();
            return res;
        }
        catch (Exception e)
        {
            throw new Exception("Ошибка при обращении к серверу " + whoisServer);
        }

    }

    private string Lookup(string whoisServer, string domainName)
    {
        try
        {
            if (string.IsNullOrEmpty(whoisServer) || string.IsNullOrEmpty(domainName))
                return null;

            //Punycode-конвертер (если требуется)
            Func<string, string> formatDomainName = delegate(string name)
            {
                return name.ToLower()
                    //если в названии домена есть нелатинские буквы и это не цифры и не точка и не тире,
                    //например, "россия.рф" то сконвертировать имя в XN--H1ALFFA9F.XN--P1AI
                    .Any(v => !"abcdefghijklmnopqrstuvdxyz0123456789.-".Contains(v))
                    ? new IdnMapping().GetAscii(name)
                    : //вернуть в Punycode
                    name; //вернуть исходный вариант
            };

            StringBuilder result = new StringBuilder();
            result.AppendLine("По данным " + whoisServer + ": ------------------------------------------");
            using (TcpClient tcpClient = new TcpClient())
            {
                //открываем соединение с сервером WHOIS
                tcpClient.Connect(whoisServer.Trim(), 43);
                byte[] domainQueryBytes = Encoding.ASCII.GetBytes(formatDomainName(domainName) + "\r\n");
                using (Stream stream = tcpClient.GetStream())
                {
                    //отправляем запрос на сервер WHOIS
                    stream.Write(domainQueryBytes, 0, domainQueryBytes.Length);
                    //читаем ответ в формате UTF8, так как некоторые национальные домены содержат информацию на местном языке
                    using (StreamReader sr = new StreamReader(tcpClient.GetStream(), Encoding.UTF8))
                    {
                        string row;
                        while ((row = sr.ReadLine()) != null)
                            result.AppendLine(row);
                    }
                }
            }

            result.AppendLine("---------------------------------------------------------------------\r\n");
            return result.ToString();
        }
        catch
        {
            throw new Exception("Ошибка при обращении к серверу " + whoisServer);
        }
        
        return "Не удалось получить данные с сервера " + whoisServer;
    }

    public static bool IsIP(string input)
    {
        IPAddress ip;
        return IPAddress.TryParse(input, out ip);
    }
}