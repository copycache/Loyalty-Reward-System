<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateTblTree extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('tbl_tree_sponsor', function (Blueprint $table) 
        {
            $table->increments('tree_sponsor_id');
            $table->integer('sponsor_parent_id')->unsigned();
            $table->integer('sponsor_child_id')->unsigned();
            $table->integer('sponsor_level')->unsigned();

            $table->foreign('sponsor_parent_id')->references('slot_id')->on('tbl_slot')->onDelete('cascade');
            $table->foreign('sponsor_child_id')->references('slot_id')->on('tbl_slot')->onDelete('cascade');
        });

        Schema::create('tbl_tree_placement', function (Blueprint $table) 
        {
            $table->increments('tree_placement_id');
            $table->integer('placement_parent_id')->unsigned();
            $table->integer('placement_child_id')->unsigned();
            $table->integer('placement_level')->unsigned();
            $table->string('placement_position');

            $table->foreign('placement_parent_id')->references('slot_id')->on('tbl_slot')->onDelete('cascade');
            $table->foreign('placement_child_id')->references('slot_id')->on('tbl_slot')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        //
    }
}
