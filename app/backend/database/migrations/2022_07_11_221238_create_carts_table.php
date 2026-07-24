<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateCartsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('carts', function (Blueprint $table) {
            $table->increments('id');
            $table->string('archived')->nullable();
            $table->string('bind_membership_id')->nullable();
            $table->string('code_user')->nullable();
            $table->string('discounted_price')->nullable();
            $table->string('inclusive_gc')->nullable();
            $table->string('inventory_branch_id')->nullable();
            $table->string('inventory_id')->nullable();
            $table->string('inventory_item_id')->nullable();
            $table->string('inventory_quantity')->nullable();
            $table->string('inventory_sold')->nullable();
            $table->string('inventory_status')->nullable();
            $table->string('inventory_total')->nullable();
            $table->string('is_kit_upgrade')->nullable();
            $table->string('item_availability')->nullable();
            $table->string('item_barcode')->nullable();
            $table->string('item_binary_pts')->nullable();
            $table->string('item_category')->nullable();
            $table->string('item_date_created')->nullable();
            $table->string('item_description')->nullable();
            $table->string('item_gc_price')->nullable();
            $table->string('item_id')->nullable();
            $table->string('item_inventory_id')->nullable();
            $table->string('item_price')->nullable();
            $table->string('item_pv')->nullable();
            $table->string('item_qty')->nullable();
            $table->string('item_sku')->nullable();
            $table->string('item_sub_category')->nullable();
            $table->string('item_thumbnail')->nullable();
            $table->string('item_type')->nullable();
            $table->string('membership_id')->nullable();
            $table->string('product_id')->nullable();
            $table->string('qty_charged')->nullable();
            $table->string('slot_qty')->nullable();
            $table->string('tag_as')->nullable();
            $table->string('upgrade_own')->nullable();
            $table->string('website_branch')->nullable();
            $table->integer('slot_owner');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('carts');
    }
}
