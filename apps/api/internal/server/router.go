package server

import (
	"log/slog"
	"net/http"

	"github.com/church-page/api/internal/cloudinary"
	"github.com/church-page/api/internal/config"
	"github.com/church-page/api/internal/handler"
	"github.com/church-page/api/internal/middleware"
	"github.com/go-chi/chi/v5"
	chimiddleware "github.com/go-chi/chi/v5/middleware"
	httpSwagger "github.com/swaggo/http-swagger"
	"gorm.io/gorm"

	_ "github.com/church-page/api/docs"
)

type Deps struct {
	Config     config.Config
	Logger     *slog.Logger
	DB         *gorm.DB
	Cloudinary *cloudinary.Client
}

func NewRouter(deps Deps) http.Handler {
	r := chi.NewRouter()

	r.Use(chimiddleware.RequestID)
	r.Use(chimiddleware.RealIP)
	r.Use(chimiddleware.Recoverer)
	r.Use(middleware.Logger(deps.Logger))
	r.Use(middleware.CORS(deps.Config.CORSOrigins))
	r.Use(middleware.RequireGateway(deps.Config.GatewaySharedSecret))

	health := handler.NewHealthHandler(deps.Config, deps.DB)
	auth := handler.NewAuthHandler()

	r.Get("/health", health.Liveness)
	r.Get("/ready", health.Readiness)

	r.Get("/swagger/*", httpSwagger.Handler(
		httpSwagger.URL("/swagger/doc.json"),
	))

	r.Route("/api/v1", func(api chi.Router) {
		api.Get("/auth/me", auth.Me)
		api.Post("/auth/register", auth.Register)
		api.Post("/auth/login", auth.Login)
		api.Post("/auth/logout", auth.Logout)

		if deps.DB != nil {
			articles := handler.NewArticlesHandler(deps.DB)
			boards := handler.NewBoardsHandler(deps.DB)
			activities := handler.NewActivitiesHandler(deps.DB)
			assets := handler.NewAssetsHandler(deps.DB, deps.Cloudinary)

			api.Get("/articles", articles.ListPublic)
			api.Get("/articles/{slug}", articles.GetPublic)
			api.Get("/board", boards.GetPublic)
			api.Get("/activities", activities.ListPublic)
			api.Get("/activities/{slug}", activities.GetPublic)

			api.Route("/admin", func(admin chi.Router) {
				admin.Use(middleware.RequireAdmin(deps.Config.AdminAPIToken))

				admin.Get("/assets", assets.List)
				admin.Post("/assets", assets.Upload)
				admin.Get("/assets/{id}", assets.Get)
				admin.Delete("/assets/{id}", assets.Delete)

				admin.Get("/articles", articles.ListAdmin)
				admin.Post("/articles", articles.Create)
				admin.Get("/articles/{id}", articles.GetAdmin)
				admin.Put("/articles/{id}", articles.Update)
				admin.Delete("/articles/{id}", articles.Delete)

				admin.Get("/board", boards.GetAdmin)
				admin.Put("/board/settings", boards.UpdateSettings)
				admin.Get("/board/ministries", boards.ListMinistries)
				admin.Post("/board/ministries", boards.CreateMinistry)
				admin.Put("/board/ministries/{id}", boards.UpdateMinistry)
				admin.Delete("/board/ministries/{id}", boards.DeleteMinistry)
				admin.Get("/board/ministries/{id}/posts", boards.ListPosts)
				admin.Post("/board/ministries/{id}/posts", boards.CreatePost)
				admin.Get("/board/posts/{id}", boards.GetPost)
				admin.Put("/board/posts/{id}", boards.UpdatePost)
				admin.Delete("/board/posts/{id}", boards.DeletePost)

				admin.Get("/activities", activities.ListAdmin)
				admin.Post("/activities", activities.Create)
				admin.Get("/activities/{id}", activities.GetAdmin)
				admin.Put("/activities/{id}", activities.Update)
				admin.Delete("/activities/{id}", activities.Delete)
			})
		}
	})

	return r
}
