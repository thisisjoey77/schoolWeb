"use client";
import React, { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import { useRouter, useSearchParams } from "next/navigation";
import { PostWithReplies } from './types';
import { allPosts } from './centralData';

const categories = [
	"All",
	"General",
	"Math",
	"AP Calculus AB",
	"AP Calculus BC",
	"Algebra 1",
	"Algebra 2", 
	"Geometry",
	"Pre-Calculus",
	"Statistics",
	"Physics 1",
	"AP Physics 1",
	"AP Physics 2", 
	"AP Physics C: Mechanics",
	"AP Physics C: E&M",
	"Chemistry",
	"AP Chemistry",
	"Honors Chemistry",
	"Biology",
	"AP Biology",
	"Honors Biology",
	"Environmental Science",
	"AP Environmental Science",
	"English 9",
	"English 10", 
	"English 11",
	"English 12",
	"AP English Language",
	"AP English Literature",
	"World History",
	"US History",
	"AP World History",
	"AP US History",
	"AP European History",
	"Government",
	"AP Government",
	"Economics",
	"AP Economics",
	"Spanish 1",
	"Spanish 2",
	"Spanish 3",
	"AP Spanish",
	"French 1",
	"French 2", 
	"French 3",
	"AP French",
	"Computer Science",
	"AP Computer Science A",
	"AP Computer Science Principles",
	"Art",
	"AP Art",
	"Music",
	"Band",
	"Orchestra",
	"Choir",
	"Theater",
	"PE/Health",
	"Study Hall",
	"Other"
];

function getPreview(text: string, maxLines = 3) {
	const lines = text.split("\n");
	return (
		lines.slice(0, maxLines).join(" ") +
		(lines.length > maxLines ? "..." : "")
	);
}

export default function Home() {
	const [selectedCategory, setSelectedCategory] = useState<string>("All");
	const [openReplies, setOpenReplies] = useState<number | null>(null);
	const [searchQuery, setSearchQuery] = useState<string>("");
	const [filteredPosts, setFilteredPosts] = useState(allPosts);
	const router = useRouter();
	const searchParams = useSearchParams();

	// Handle search from URL params or search bar
	useEffect(() => {
		const urlSearch = searchParams.get('search');
		if (urlSearch) {
			setSearchQuery(urlSearch);
			handleSearch(urlSearch);
		}
	}, [searchParams]);

	const handleSearch = (query: string) => {
		setSearchQuery(query);
		if (!query.trim()) {
			// If no search query, filter by category
			if (selectedCategory === "All") {
				setFilteredPosts(allPosts);
			} else {
				setFilteredPosts(allPosts.filter(post => post.category === selectedCategory));
			}
		} else {
			// Search in both title and content
			const searchResults = allPosts.filter(post => 
				post.title.toLowerCase().includes(query.toLowerCase()) ||
				post.content.toLowerCase().includes(query.toLowerCase())
			);
			setFilteredPosts(searchResults);
		}
	};

	// Update filtered posts when category changes (only if no search query)
	useEffect(() => {
		if (!searchQuery.trim()) {
			if (selectedCategory === "All") {
				setFilteredPosts(allPosts);
			} else {
				setFilteredPosts(allPosts.filter(post => post.category === selectedCategory));
			}
		}
	}, [selectedCategory, searchQuery]);

	return (
		<div className="min-h-screen bg-gray-50 relative">
			{/* Background Pattern */}
			<div className="absolute inset-0 opacity-5">
				<div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-transparent to-yellow-500"></div>
				<div
					className="absolute inset-0"
					style={{
						backgroundImage: `radial-gradient(circle at 25px 25px, #1e40af 2px, transparent 2px)`,
						backgroundSize: "50px 50px",
					}}
				></div>
			</div>

			<Navbar onSearch={handleSearch} />
			
			{/* Main Content */}
			<div className="pl-64 pt-20"> {/* Account for sidebar and top bar */}
				<main className="max-w-4xl mx-auto p-6">
					{/* Search Results Header */}
					{searchQuery && (
						<div className="mb-6">
							<h2 className="text-2xl font-bold text-blue-700 mb-2">
								Search Results for "{searchQuery}"
							</h2>
							<p className="text-gray-600">
								Found {filteredPosts.length} result(s)
							</p>
							<button 
								onClick={() => {
									setSearchQuery('');
									if (selectedCategory === "All") {
										setFilteredPosts(allPosts);
									} else {
										setFilteredPosts(allPosts.filter(post => post.category === selectedCategory));
									}
								}}
								className="text-blue-600 hover:text-yellow-600 underline mt-2"
							>
								Clear search
							</button>
						</div>
					)}

					{/* Category Filter (only show if not searching) */}
					{!searchQuery && (
						<div className="mb-6">
							<h1 className="text-3xl font-bold text-blue-700 mb-4">
								School Forum
							</h1>
							<div className="flex items-center gap-4 mb-4">
								<label className="text-blue-700 font-semibold">Filter by Category:</label>
								<select
									value={selectedCategory}
									onChange={(e) => setSelectedCategory(e.target.value)}
									className="px-3 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
								>
									{categories.map((category) => (
										<option key={category} value={category}>
											{category}
										</option>
									))}
								</select>
							</div>
						</div>
					)}

					{/* Posts List */}
					{filteredPosts.length === 0 ? (
						<div className="bg-white rounded-lg p-8 shadow-lg border border-gray-200 text-center">
							<h2 className="text-xl font-semibold text-gray-600 mb-2">
								{searchQuery ? 'No posts found' : 'No threads in this category'}
							</h2>
							<p className="text-gray-500">
								{searchQuery ? 'Try adjusting your search terms' : 'Be the first to start a discussion!'}
							</p>
						</div>
					) : (
						filteredPosts.map((post) => (
							<div
								key={post.post_id}
								className="mb-4 rounded-lg bg-white p-6 shadow-lg border border-gray-200 cursor-pointer hover:shadow-xl hover:border-yellow-400 transition-all duration-200"
								onClick={() => router.push(`/post/${post.post_id}`)}
							>
								<h2 className="text-2xl font-bold text-blue-700 mb-2">
									{post.title}
								</h2>
								<div className="text-gray-600 mb-1">
									<span className="font-semibold text-yellow-600 bg-yellow-50 px-2 py-1 rounded">
										{post.category}
									</span>{" "}
									• by{" "}
									<span className="text-blue-600 font-semibold">
										{post.anonymous ? 'Anonymous' : post.author_id}
									</span>{" "}
									•{" "}
									<span className="text-gray-500">{new Date(post.upload_time).toLocaleDateString()}</span>
									{post.validated === 0 && <span className="text-red-600 ml-2 font-semibold">• Pending Validation</span>}
								</div>
								<div className="text-gray-700 mt-2 mb-2">
									{getPreview(post.content)}
								</div>
								<button
									className="mt-2 text-blue-600 underline hover:text-yellow-600 font-medium"
									onClick={(e) => {
										e.stopPropagation();
										setOpenReplies(openReplies === post.post_id ? null : post.post_id);
									}}
								>
									{openReplies === post.post_id
										? "Hide replies"
										: `View replies (${post.replies.length})`}
								</button>
								{openReplies === post.post_id && (
									<div className="mt-3 bg-gray-100 rounded p-3 border-l-4 border-blue-600">
										{post.replies.length === 0 ? (
											<div className="text-gray-500">No replies yet.</div>
										) : (
											post.replies.map((reply) => (
												<div key={reply.reply_id} className="mb-2">
													<span className="text-blue-600 font-semibold">
														{reply.anonymous ? 'Anonymous' : reply.author_id}:
													</span>{" "}
													<span className="text-gray-700">
														{reply.content}
													</span>
													{reply.validated === 0 && <span className="text-red-600 ml-2 text-xs">• Pending</span>}
												</div>
											))
										)}
									</div>
								)}
							</div>
						))
					)}
				</main>
			</div>
		</div>
	);
}
