import { NextRequest, NextResponse } from "next/server";
import { createClient, SupabaseClient } from "@supabase/supabase-js";

let _admin: SupabaseClient | null = null;
function getAdmin() {
    if (!_admin) {
        _admin = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        );
    }
    return _admin;
}

type PhotoType = "packing" | "shipping_label" | "delivery_proof" | "receipt_condition" | "dispute_evidence";

const VALID_PHOTO_TYPES: PhotoType[] = [
    "packing",
    "shipping_label",
    "delivery_proof",
    "receipt_condition",
    "dispute_evidence",
];

/**
 * GET /api/orders/photos?orderId=xxx
 * Fetch all photos for an order (both farmer and buyer photos)
 */
export async function GET(req: NextRequest) {
    try {
        const orderId = req.nextUrl.searchParams.get("orderId");
        if (!orderId) {
            return NextResponse.json({ error: "orderId required" }, { status: 400 });
        }

        const { data, error } = await getAdmin()
            .from("order_photos")
            .select("*, uploaded_by_profile:profiles!uploaded_by(full_name, role)")
            .eq("order_id", orderId)
            .order("created_at", { ascending: true });

        if (error) throw error;

        return NextResponse.json({ photos: data });
    } catch (err) {
        console.error("Failed to fetch order photos:", err);
        return NextResponse.json({ error: "Failed to fetch photos" }, { status: 500 });
    }
}

/**
 * POST /api/orders/photos
 * Upload a delivery proof photo
 *
 * Body: FormData with:
 *   - file: image file (JPEG, PNG, WebP, max 10MB)
 *   - orderId: UUID
 *   - photoType: one of VALID_PHOTO_TYPES
 *   - caption: optional text
 */
export async function POST(req: NextRequest) {
    try {
        const fd: any = await req.formData();
        const file: File | null = fd.get("file");
        const orderId: string = fd.get("orderId");
        const photoType = fd.get("photoType") as PhotoType;
        const caption: string | null = fd.get("caption");

        // Validate inputs
        if (!file || !orderId || !photoType) {
            return NextResponse.json({ error: "file, orderId, and photoType are required" }, { status: 400 });
        }

        if (!VALID_PHOTO_TYPES.includes(photoType)) {
            return NextResponse.json({ error: `Invalid photoType. Must be: ${VALID_PHOTO_TYPES.join(", ")}` }, { status: 400 });
        }

        // Validate file type
        const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
        if (!allowedTypes.includes(file.type)) {
            return NextResponse.json({ error: "Only JPEG, PNG, and WebP images are allowed" }, { status: 400 });
        }

        // Validate file size (10MB max)
        if (file.size > 10 * 1024 * 1024) {
            return NextResponse.json({ error: "File must be under 10MB" }, { status: 400 });
        }

        // Get auth user from header (passed from client)
        const authHeader = req.headers.get("authorization");
        if (!authHeader) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const token = authHeader.replace("Bearer ", "");
        const { data: { user }, error: authError } = await getAdmin().auth.getUser(token);
        if (authError || !user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Verify user is participant in this order
        const { data: order, error: orderError } = await getAdmin()
            .from("orders")
            .select("buyer_id, farmer_id")
            .eq("id", orderId)
            .single();

        if (orderError || !order) {
            return NextResponse.json({ error: "Order not found" }, { status: 404 });
        }

        if (order.buyer_id !== user.id && order.farmer_id !== user.id) {
            return NextResponse.json({ error: "Not a participant in this order" }, { status: 403 });
        }

        // Validate photo type matches role
        const isFarmer = order.farmer_id === user.id;
        const farmerTypes: PhotoType[] = ["packing", "shipping_label", "delivery_proof"];
        const buyerTypes: PhotoType[] = ["receipt_condition"];
        const bothTypes: PhotoType[] = ["dispute_evidence"];

        if (isFarmer && !farmerTypes.includes(photoType) && !bothTypes.includes(photoType)) {
            return NextResponse.json({ error: "Farmers can only upload packing, shipping_label, delivery_proof, or dispute_evidence photos" }, { status: 400 });
        }
        if (!isFarmer && !buyerTypes.includes(photoType) && !bothTypes.includes(photoType)) {
            return NextResponse.json({ error: "Buyers can only upload receipt_condition or dispute_evidence photos" }, { status: 400 });
        }

        // Upload to Supabase Storage
        const ext = file.name.split(".").pop() || "jpg";
        const fileName = `${orderId}/${photoType}_${Date.now()}.${ext}`;
        const arrayBuffer = await file.arrayBuffer();

        const { error: uploadError } = await getAdmin().storage
            .from("order-photos")
            .upload(fileName, arrayBuffer, {
                contentType: file.type,
                upsert: false,
            });

        if (uploadError) {
            console.error("Storage upload failed:", uploadError);
            return NextResponse.json({ error: "Failed to upload file" }, { status: 500 });
        }

        // Get public URL
        const { data: urlData } = getAdmin().storage
            .from("order-photos")
            .getPublicUrl(fileName);

        // Create database record
        const { data: photo, error: dbError } = await getAdmin()
            .from("order_photos")
            .insert({
                order_id: orderId,
                uploaded_by: user.id,
                photo_type: photoType,
                photo_url: urlData.publicUrl,
                caption: caption || null,
            })
            .select()
            .single();

        if (dbError) {
            console.error("DB insert failed:", dbError);
            return NextResponse.json({ error: "Failed to save photo record" }, { status: 500 });
        }

        // Log the upload as an order update
        await getAdmin().from("order_updates").insert({
            order_id: orderId,
            update_type: "photo_uploaded",
            message: `${isFarmer ? "Farmer" : "Buyer"} uploaded ${photoType.replace(/_/g, " ")} photo${caption ? `: ${caption}` : ""}`,
            created_by: user.id,
        });

        return NextResponse.json({ photo });
    } catch (err) {
        console.error("Photo upload error:", err);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
