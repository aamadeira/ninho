import { type RouteObject } from "react-router";
import { AppLayout } from "./components/AppLayout";
import { HomeRedirect } from "./components/HomeRedirect";
import { RequireAuth } from "./components/RequireAuth";
import { RequireFeature } from "./components/RequireFeature";
import { CalendarPage } from "./pages/calendar/CalendarPage";
import { NinhoPage } from "./pages/ninho/NinhoPage";
import { LoginPage } from "./pages/login/LoginPage";
import { RecipePage } from "./pages/recipes/RecipePage";
import { RecipesPage } from "./pages/recipes/RecipesPage";
import { ShoppingPage } from "./pages/shopping/ShoppingPage";
import { TodosPage } from "./pages/todos/TodosPage";

export const routes: RouteObject[] = [
    { path: "login", element: <LoginPage /> },
    {
        element: <RequireAuth />,
        children: [
            {
                element: <AppLayout />,
                children: [
                    { index: true, element: <HomeRedirect /> },
                    {
                        element: <RequireFeature feature="todos" />,
                        children: [{ path: "todos", element: <TodosPage /> }]
                    },
                    {
                        element: <RequireFeature feature="shopping" />,
                        children: [{ path: "shopping", element: <ShoppingPage /> }]
                    },
                    {
                        element: <RequireFeature feature="recipes" />,
                        children: [
                            { path: "recipes", element: <RecipesPage /> },
                            { path: "recipes/:recipeId", element: <RecipePage /> }
                        ]
                    },
                    {
                        element: <RequireFeature feature="calendar" />,
                        children: [{ path: "calendar", element: <CalendarPage /> }]
                    },
                    { path: "ninho", element: <NinhoPage /> },
                    { path: "*", element: <HomeRedirect /> }
                ]
            }
        ]
    }
];
