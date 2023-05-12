using System.Text.Json;
using System;
using System.Net.Mime;
using Microsoft.Extensions.FileProviders;

internal class Program
{
    private static void Main(string[] args)
    {
        var builder = WebApplication.CreateBuilder(
            new WebApplicationOptions { WebRootPath = "assets" }
        );

        var app = builder.Build();
        app.UseStaticFiles();



        string jsonPath = "assets\\json";
        string imagesPath = "assets\\image";


        string[] allFiles = Directory.GetFiles(jsonPath);
        List<string> allTests = new List<string>();
        for (int i = 0; i < allFiles.Length; i++)
        {
            allTests.Add(
                allFiles[i].Replace(jsonPath + "\\", "").Substring(0, 1)
                );
        }


        app.MapGet("/", async (context) =>
        {
            context.Response.ContentType = "text/html; charset=utf-8";
            await context.Response.SendFileAsync("assets/index.html");
        });
        

        app.MapGet("/api/test/{id}", async (string id) =>
        {
            if (!allTests.Contains(id)) return null;

            string testPath = jsonPath + "\\" + id + ".json"; //asswets\\json\\1.json
            Test? test;

            using (FileStream fs = new FileStream(testPath, FileMode.OpenOrCreate))
            {
                test = new Test(
                    await JsonSerializer.DeserializeAsync<Question[]>(fs)
                    );
            }

            if (test == null) return null;

            return Results.Json(test.questions);
        });


        app.MapGet("/api/exam", async () =>
        {
            List<Question>? exam = new List<Question>();
            foreach (string s in allTests)
            {
                string testPath = jsonPath + "\\" + s + ".json";
                using (FileStream fs = new FileStream(testPath, FileMode.OpenOrCreate))
                {
                    Test test = new Test(await JsonSerializer.DeserializeAsync<Question[]>(fs)); ;
                    exam.AddRange(test.questions);
                    
                }
            }
            Shuffle(exam);
            exam.RemoveRange(0, 10);
            return Results.Json(exam);
        });

        app.MapGet("assets/image/{id}", async (string id, HttpContext context) =>
        {

            await context.Response.SendFileAsync(imagesPath + "\\" + id);
        });

        app.MapGet("api/count", () => Results.Json(allTests));


        app.Run();

        void Shuffle<T>(List<T> array)
        {
            Random random = new Random();

            for (int i = array.Count - 1; i > 0; i--)
            {
                int j = random.Next(i + 1);
                T temp = array[i];
                array[i] = array[j];
                array[j] = temp;
            }
        }
    }
}

record Test(Question[] questions);

record Question(
    int answer, 
    string first, 
    string second, 
    string third, 
    string question, 
    string url
);
