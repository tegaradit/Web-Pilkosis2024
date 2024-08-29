import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import {
	createBrowserRouter,
	redirect,
	RouterProvider,
} from "react-router-dom";
import Login from "./pages/auth/login/login.tsx";
import requestLogin from "@utils/action/login.ts";
import NotFound from "@pages/notFound.tsx";
import authorizer from "@utils/authorizer.ts";

const router = createBrowserRouter([
	{
		path: "/",
		element: <App />,
		children: [
			{
				index: true,
				element: <Login />,
				action: requestLogin,
				loader: async () => { 
					if (await authorizer('user', 'onLoginPage')) return redirect('/voting')
						return false
				},
			},
			{
				path: "voting",
				async lazy() {
					const LayoutVote = (await import("./pages/voting/layout.tsx")).default;
					const vote = (await import("./utils/action/vote.ts")).default;
					return { Component: LayoutVote, loader: async () => await authorizer('user'), action: vote };
				},
				children: [
					{
						index: true,
						async lazy() {
							const IndexVote = (await import("./pages/voting/index.tsx")).default;
							const getDataPaslon = (await import("./utils/loader/paslon.ts")).default;
							return { Component: IndexVote, loader: getDataPaslon };
						},
					},
					{
						path: "tentang",
						async lazy() {
							const AboutVote = (await import("./pages/voting/about.tsx")).default;
							return { Component: AboutVote };
						},
					},
					{
						path: "umpan-balik",
						async lazy() {
							const FeedbackVote = (await import("./pages/voting/feedback.tsx")).default;
							const feedbcack = (await import("./utils/action/feedback.ts")).default;
							return { Component: FeedbackVote, action: feedbcack};
							
						},
					},
				],
			},
			{
				path: "admin",
				async lazy() {
					const LayoutAdmin = (await import("./pages/admin/layout.tsx")).default;
					return { Component: LayoutAdmin };
				},
				children:[
					{
                        path: "paslon",
                        async lazy() {
                            const PaslonList = (await import("./pages/admin/count.tsx")).default;
                            return { Component: PaslonList };
                        },
                    }
				]
			},
		],
	},
	{
		path: "/not-found",
		Component: NotFound,
	},
	{
		path: "*",
		loader: () => redirect("/not-found"),
	},
]);

ReactDOM.createRoot(document.getElementById("root")!).render(
	<RouterProvider router={router} />
);
