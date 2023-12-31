import request from 'supertest'
import {app, RouterPaths} from "../../src"
import {BlogCreateModel} from "../../src/types/blogs/input";
import {OutputBlogType} from "../../src/types/blogs/output";
import {blogTestManager} from "../utils/blogTestManager";


describe('/blogs', () => {
    // Очищаем БД
    beforeAll(async ()=>{
        await request(app)
            .delete('/testing/all-data')
})


    // Проверяем что БД пустая
    it('should return 200 and empty []',async () =>{
       await request(app)
            .get(RouterPaths.blogs)
            .expect(200, [])
    })

    //Переменные для хранения данных созданных видео
    let createdBlog : OutputBlogType
    let secondCreatedBlog : OutputBlogType;
    const blogData: BlogCreateModel = {
        "name": "Felix",
        "description": "Secret",
        "websiteUrl": "https://iaWvPbi4nnt1cAej2P1InTA.XtfqLdbJEXn29s9xpDzU762y._qXDYoZFu-TSCTCLhfR.RyF-B3dMemIrQ.INbBcnB3u"
    }
    const wrongBlogData: BlogCreateModel = {
        "name": "SecretSecretSecretSecretSecretSecretSecretSecretSecretSecretSecret",
        "description": "",
        "websiteUrl": "http://iaWvPbi4nnt1cAej2P1InTA.XtfqLdbJEXn29s9xpDzU762y._qXDYoZFu-TSCTCLhfR.RyF-B3dMemIrQ.INbBcnB3u"
    }


    // Пытаемся создать блог с неправильными данными
    it("should'nt create blogs with incorrect input data ",async () => {

        //Отсылаем неправильнные данные
        const createResponse = await blogTestManager.createBlog(wrongBlogData, 400)

        const errorsMessage = createResponse.body
            expect(errorsMessage).toEqual({
                errorsMessages: [
                    { message: 'Incorrect websiteUrl', field: 'websiteUrl' },
                    { message: 'Incorrect description', field: 'description' },
                    { message: 'Incorrect name', field: 'name' }
                ]
            })

    })

    //Не проходим проверку логина и пароля
    it("should'nt create blogs without login and pass ",async () => {
        await request(app)
            .post(RouterPaths.blogs)
            .auth('aaaa', 'qwert')
            .expect(401, "Unauthorized")
    })



    // Создаем блог
    it("should CREATE blogs with correct input data ",async () =>{
        const createResponse = await blogTestManager.createBlog(blogData, 201)

        //Проверяем что созданный блог соответствует заданным параметрам
        createdBlog =  createResponse.body;
        expect(createdBlog).toEqual({
            "id": expect.any(String),
            "name": "Felix",
            "description": "Secret",
            "websiteUrl": "https://iaWvPbi4nnt1cAej2P1InTA.XtfqLdbJEXn29s9xpDzU762y._qXDYoZFu-TSCTCLhfR.RyF-B3dMemIrQ.INbBcnB3u",
            "createdAt": expect.any(String),
            "isMembership": false
        })

        //Проверяем что создался только один блог
        await request(app)
            .get(RouterPaths.blogs)
            .expect(200, [createdBlog])
    })

    // Создаем второй блог
    it("should CREATE blogs with correct input data ",async () =>{
        const createResponse = await blogTestManager.createBlog(blogData, 201)

        //Проверяем что созданный блог соответствует заданным параметрам
        secondCreatedBlog =  createResponse.body;
        expect(secondCreatedBlog).toEqual({
            "id": expect.any(String),
            "name": "Felix",
            "description": "Secret",
            "websiteUrl": "https://iaWvPbi4nnt1cAej2P1InTA.XtfqLdbJEXn29s9xpDzU762y._qXDYoZFu-TSCTCLhfR.RyF-B3dMemIrQ.INbBcnB3u",
            "createdAt": expect.any(String),
            "isMembership": false
        })

        // Проверяем что созданные айди у двух блогов разные
        expect(createdBlog.id).not.toEqual(secondCreatedBlog.id)

        //Проверяем что в бд теперь два блога
        await request(app)
            .get(RouterPaths.blogs)
            .expect(200, [createdBlog, secondCreatedBlog])
    })

    //Пытаемся обновить createdBlog c неправильными данными
    it("should'nt UPDATE video with incorrect input data ",async () => {
        await request(app)
            .put(`${RouterPaths.blogs}/${encodeURIComponent(createdBlog.id)}`)
            .auth('admin', 'qwerty')
            .send(wrongBlogData)
            .expect(400, {
                errorsMessages: [
                    { message: 'Incorrect websiteUrl', field: 'websiteUrl' },
                    { message: 'Incorrect description', field: 'description' },
                    { message: 'Incorrect name', field: 'name' }
                ]
            })

        // Попытка обновить без логина и пароля
        await request(app)
            .put(`${RouterPaths.blogs}/${encodeURIComponent(createdBlog.id)}`)
            .auth('adminn', 'qwertn')
            .send(wrongBlogData)
            .expect(401, 'Unauthorized')

        // Проверяем что блог не обновился
        await request(app)
            .get(`${RouterPaths.blogs}/${encodeURIComponent(createdBlog.id)}`)
            .expect(200, createdBlog)
    })
     // Пытаемя обновить secondCreatedBlog с неправильными данными
    it("should'nt UPDATE video with incorrect input data ",async () => {
        await request(app)
            .put(`${RouterPaths.blogs}/${encodeURIComponent(secondCreatedBlog.id)}`)
            .auth('admin', 'qwerty')
            .send(wrongBlogData)
            .expect(400, {
                errorsMessages: [
                    { message: 'Incorrect websiteUrl', field: 'websiteUrl' },
                    { message: 'Incorrect description', field: 'description' },
                    { message: 'Incorrect name', field: 'name' }
                ]
            })

        // Попытка обновить без логина и пароля
        await request(app)
            .put(`${RouterPaths.blogs}/${encodeURIComponent(secondCreatedBlog.id)}`)
            .auth('adminn', 'qwertn')
            .send(wrongBlogData)
            .expect(401, 'Unauthorized')

        // Проверяем что блог не обновился
        await request(app)
            .get(`${RouterPaths.blogs}/${encodeURIComponent(secondCreatedBlog.id)}`)
            .expect(200, secondCreatedBlog)
    })

    // Обновляем данные createdBlog
     it("should UPDATE blogs with correct input data ",async () =>{
         await request(app)
             .put(`${RouterPaths.blogs}/${encodeURIComponent(createdBlog.id)}`)
             .auth('admin', 'qwerty')
             .send(blogData)
             .expect(204)

         // Проверяем что первый блог изменился
         await request(app)
             .get(`${RouterPaths.blogs}/${encodeURIComponent(createdBlog.id)}`)
             .expect(200, {
                 ...createdBlog,
                 ...blogData
             })

         // Обновляем запись с первым блогом
         createdBlog = {
             ...createdBlog,
             ...blogData
         }
     })
     // Обновляем данные второго блога
    it("should UPDATE blogs with correct input data ",async () =>{
        await request(app)
            .put(`${RouterPaths.blogs}/${encodeURIComponent(secondCreatedBlog.id)}`)
            .auth('admin', 'qwerty')
            .send(blogData)
            .expect(204)

        // Проверяем что блог изменился
        await request(app)
            .get(`${RouterPaths.blogs}/${encodeURIComponent(secondCreatedBlog.id)}`)
            .expect(200, {
                ...secondCreatedBlog,
                ...blogData
            })

        // Обновляем запись с блогом
        secondCreatedBlog = {
            ...secondCreatedBlog,
            ...blogData
        }
    })

    // Удаляем createdBlog
    it("should DELETE blogs with correct id ",async () =>{
        await request(app)
            .delete(`${RouterPaths.blogs}/${encodeURIComponent(createdBlog.id)}`)
            .auth('admin', 'qwerty')
            .expect(204)

         // Проверяем что второй блог на месте а первый  удалиллся
         await request(app)
             .get(`${RouterPaths.blogs}`)
             .expect([secondCreatedBlog])

    })
    // Удаляем второй блог
    it("should DELETE second blog with correct input data ",async () => {
        await request(app)
            .delete(`${RouterPaths.blogs}/${encodeURIComponent(secondCreatedBlog.id)}`)
            .auth('admin', 'qwerty')
            .expect(204)
    })

    // Проверяем что БД пустая
    it('should return 200 and empty []',async () =>{
        await request(app)
            .get(RouterPaths.blogs)
            .expect(200, [])
    })

})


