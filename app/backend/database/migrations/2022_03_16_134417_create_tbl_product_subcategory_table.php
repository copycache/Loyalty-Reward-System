<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateTblProductSubcategoryTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('tbl_product_subcategory', function (Blueprint $table) {
            $table->increments('id');

            $table->integer('category_id')->unsigned();            
            $table->string('sub_category_name')->nullable();
            $table->integer('archive')->default(0);

            $table->foreign('category_id')->references('id')->on('tbl_product_category')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('tbl_product_subcategory');
    }
}
